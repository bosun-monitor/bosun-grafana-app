import TableModel from 'app/core/table_model';
import moment from 'moment';

export class BosunDatasource {
    constructor(instanceSettings, $q, backendSrv, templateSrv, $sce, $rootScope) {
        this.annotateUrl = instanceSettings.jsonData.annotateUrl;
        this.openTSDBUrl  = instanceSettings.jsonData.openTSDBUrl;
        this.type = instanceSettings.type;
        this.url = instanceSettings.url;
        this.name = instanceSettings.name;
        this.showHelper = instanceSettings.jsonData.enableQueryHelper;
        this.preRelease = instanceSettings.jsonData.enablePreReleaseFeatures;
        this.authToken = instanceSettings.jsonData.authToken;
        this.q = $q;
        this.backendSrv = backendSrv;
        this.templateSrv = templateSrv;
        this.sce = $sce;
        this.$rootScope = $rootScope;
        this.IncidentListQuery = this.IncidentListQuery.bind(this);
    }

    makeTable(result) {
        var table = new TableModel();
        if (!result || Object.keys(result).length < 1) {
            return [table];
        }
        var tagKeys = [];
        _.each(result[0].Group, function (v, tagKey) {
            tagKeys.push(tagKey);
        });
        tagKeys.sort();
        table.columns = _.map(tagKeys, function (tagKey) {
            return { "text": tagKey };
        });
        table.columns.push({ "text": "value" });
        _.each(result, function (res) {
            var row = [];
            _.each(res.Group, function (tagValue, tagKey) {
                row[tagKeys.indexOf(tagKey)] = tagValue;
            });
            row.push(res.Value);
            table.rows.push(row);
        });
        return [table];
    }

    transformMetricData(result, target, options) {
        var tagData = [];
        _.each(result.Group, function (v, k) {
            tagData.push({ 'value': v, 'key': k });
        });
        var sortedTags = _.sortBy(tagData, 'key');
        var metricLabel = "";
        if (target.alias) {
            var scopedVars = _.clone(options.scopedVars || {});
            _.each(sortedTags, function (value) {
                scopedVars['tag_' + value.key] = { "value": value.value };
            });
            metricLabel = this.templateSrv.replace(target.alias, scopedVars);
        } else {
            tagData = [];
            _.each(sortedTags, function (tag) {
                tagData.push(tag.key + '=' + tag.value);
            });
            metricLabel = '{' + tagData.join(', ') + '}';
        }
        var dps = [];
        _.each(result.Value, function (v, k) {
            dps.push([v, parseInt(k) * 1000]);
        });
        return { target: metricLabel, datapoints: dps };
    }

    performTimeSeriesQuery(query, target, options) {
        var exprDate = options.range.to.utc().format('YYYY-MM-DD');
        var exprTime = options.range.to.utc().format('HH:mm:ss');
        var url = this.url + '/api/expr?date=' + encodeURIComponent(exprDate) + '&time=' + encodeURIComponent(exprTime);
        this.postQuery = query;
        return this.bosunRequest({
            url: url,
            method: 'POST',
            data: query,
            datasource: this
        }).then(response => {
            if (response.status === 200) {
                var result;
                if (response.data.Type === 'series') {
                    result = _.map(response.data.Results, function (result) {
                        return response.config.datasource.transformMetricData(result, target, options);
                    });
                }
                if (response.data.Type === 'number') {
                    result = response.config.datasource.makeTable(response.data.Results);
                }
                if (response.data.Type === 'table') {
                    var table = new TableModel();
                    table.columns = _.map(response.data.Results[0].Value.Columns, function (column) {
                        return { "text": column };
                    });
                    table.rows = response.data.Results[0].Value.Rows;
                    result = [table];
                }
                return { data: result };
            }
        });
    }

    _metricsStartWith(metricRoot) {
        return this.bosunRequest({
            url: this.url + "/api/metric",
            method: 'GET',
            datasource: this
        }).then((data) => {
            var filtered = _.filter(data.data, (v) => {
                return v.startsWith(metricRoot);
            });
            return filtered;
        });
    }

    _tagKeysForMetric(metric) {
        return this.bosunRequest({
            url: this.url + "/api/tagk/" + metric,
            method: 'GET',
            datasource: this
        }).then((data) => {
            return data.data;
        });
    }

    _tagValuesForMetricAndTagKey(metric, key) {
        return this.bosunRequest({
            url: this.url + "/api/tagv/" + key + "/" + metric,
            method: 'GET',
            datasource: this
        }).then((data) => {
            return data.data;
        });
    }

    _metricMetadata(metric) {
        return this.bosunRequest({
            url: this.url + "/api/metadata/metrics?metric=" + metric,
            method: 'GET',
            datasource: this
        }).then((data) => {
            return data.data;
        });
    }

    metricFindQuery(query) {
        var findTransform = function (result) {
            return _.map(result, function (value) {
                return { text: value };
            });
        };
        // Get Metrics that start with the first argument
        var metricsRegex = /metrics\((.*)\)/;
        // Get tag keys for the given metric (first argument)
        var tagKeysRegex = /tagkeys\((.*)\)/;
        // Get tag values for the given metric (first argument) and tag key (second argument)
        var tagValuesRegex = /tagvalues\((.*),(.*)\)/;

        var metricsQuery = query.match(metricsRegex)
        if (metricsQuery) {
            return this._metricsStartWith(metricsQuery[1]).then(findTransform);
        }

        var tagKeysQuery = query.match(tagKeysRegex)
        if (tagKeysQuery) {
            return this._tagKeysForMetric(tagKeysQuery[1]).then(findTransform);
        }

        var tagValuesQuery = query.match(tagValuesRegex)
        if (tagValuesQuery) {
            return this._tagValuesForMetricAndTagKey(tagValuesQuery[1].trim(), tagValuesQuery[2].trim()).then(findTransform);
        }

        return this.q.when([]);
    }

    query(options) {
        var queries = [];
        // Get time values to replace $start
        // The end time is what bosun regards as 'now'
        var secondsAgo = options.range.to.diff(options.range.from.utc(), 'seconds');
        secondsAgo += 's';
        _.each(options.targets, _.bind(function (target) {
            if (!target.expr || target.hide) {
                return;
            }
            var query = {};
            query = this.templateSrv.replace(target.expr, options.scopedVars, 'pipe');
            query = query.replace(/\$start/g, secondsAgo);
            query = query.replace(/\$ds/g, options.interval);
            queries.push(query);
        }, this));

        // No valid targets, return the empty result to save a round trip.
        if (_.isEmpty(queries)) {
            var d = this.q.defer();
            d.resolve({ data: [] });
            return d.promise;
        }

        var allQueryPromise = _.map(queries, _.bind(function (query, index) {
            return this.performTimeSeriesQuery(query, options.targets[index], options);
        }, this));

        return this.q.all(allQueryPromise)
            .then(function (allResponse) {
                var result = [];
                _.each(allResponse, function (response) {
                    _.each(response.data, function (d) {
                        result.push(d);
                    });
                });
                return { data: result };
            });
    }

    _processAnnotationQueryParam(annotation, fieldName, fieldObject, params) {
        var param = {};
        var key = fieldName;
        if (!fieldObject) {
            return params;
        }
        if (fieldObject.empty) {
            key += ":Empty"
        }
        if (fieldObject.not) {
            if (!fieldObject.empty) {
                key += ":"
            }
            key += ":Empty"
        }
        params[key] = this.templateSrv.replace(fieldObject.value, this.templateSrv.variables, 'pipe');
        return params
    }


    annotationQuery(options) {
        // http://stackoverflow.com/questions/2998784/how-to-output-integers-with-leading-zeros-in-javascript
        var pad = (num, size) => {
            var s = num + "";
            while (s.length < size) s = "0" + s;
            return s;
        }
        var annotation = options.annotation;
        var params = {};
        params.StartDate = options.range.from.unix();
        params.EndDate = options.range.to.unix();
        var annotateUrl = this.annotateUrl;
        params = this._processAnnotationQueryParam(annotation, "Source", annotation.Source, params)
        params = this._processAnnotationQueryParam(annotation, "Host", annotation.Host, params)
        params = this._processAnnotationQueryParam(annotation, "CreationUser", annotation.CreationUser, params)
        params = this._processAnnotationQueryParam(annotation, "Owner", annotation.Owner, params)
        params = this._processAnnotationQueryParam(annotation, "Category", annotation.Category, params)
        params = this._processAnnotationQueryParam(annotation, "Url", annotation.Url, params)
        var url = this.url + '/api/annotation/query?';
        if (Object.keys(params).length > 0) {
            url += jQuery.param(params);
        }
        var rawUrl = this.rawUrl;
        return this.bosunRequest({
            url: url,
            method: 'GET',
            datasource: this
        }).then(response => {
            if (response.status === 200) {
                var events = [];
                _.each(response.data, (a) => {
                    var text = [];
                    var duration = moment.duration(moment(a.EndDate).diff(a.StartDate));
                    var hours = duration.hours();
                    var minutes = duration.minutes();
                    var seconds = duration.seconds();
                    text.push("Duration: " + pad(hours, 3) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2));
                    if (a.Source) {
                        text.push("Source: " + a.Source);
                    }
                    if (a.Host) {
                        text.push("Host: " + a.Host);
                    }
                    if (a.CreationUser) {
                        text.push("User: " + a.CreationUser);
                    }
                    if (a.Owner) {
                        text.push("Owner: " + a.Owner);
                    }
                    if (a.Category) {
                        text.push("Category: " + a.Category);
                    }
                    if (a.Url) {
                        text.push('<a href="' + a.Url + '">' + a.Url.substring(0, 40) + '</a>');
                    }
                    if (a.Message) {
                        text.push(a.Message);
                    }
                    text.push('<a target="_blank" href="' + annotateUrl + '/annotation?id=' + encodeURIComponent(a.Id) + '">Edit in Bosun UI</a>')
                    var grafanaAnnotation = {
                        annotation: annotation,
                        time: moment(a.StartDate).utc().unix() * 1000,
                        title: a.Category,
                        text: text.join("<br>")
                    }
                    events.push(grafanaAnnotation);
                });
                return events;
            }
        });
    }

    // Since the API response is not JSON, we need a transform interceptor to
    // handle a text response. Otherwise we just get i.e. 'Internal Server Error'
    _plainTextResponseTransform(data, headers) {
        if (headers("content-type").includes("text/plain")) {
            return { message: data };
        }
        return angular.fromJson(data);
    }

    IncidentListQuery(query) {
        var self = this;
        var url = this.url + '/api/incidents/open';
        if (query) {
            var interpolatedQuery = this.templateSrv.replace(query, this.templateSrv.variables, 'pipe');
            url += '?filter=' + encodeURIComponent(interpolatedQuery)
        }
        return this.bosunRequest({
            url: url,
            method: 'GET',
            transformResponse: this._plainTextResponseTransform
        }).then(response => {
            if (response.status === 200) {
                return response.data;
            }
        }, (error) => {
            self.$rootScope.appEvent('alert-error', ['IncidentListQuery Error', error.data.message]);
        })
    }

    AlertBodyHTML(alertKey) {
        return this.bosunRequest({
            url: this.url + '/api/status?ak=' + encodeURIComponent(alertKey),
            method: 'GET'
        }).then(response => {
            if (response.status === 200) {
                return this.sce.trustAsHtml(response.data[alertKey].Body);
            }
        })
    }

    submitAction(actionObj) {
        var self = this;
        return this.bosunRequest({
            url: this.url + '/api/action',
            method: 'POST',
            data: actionObj,
            datasource: this
        }).then((data) => {
            debugger;
            self.$rootScope.appEvent('alert-success', ['Incident Action Succeeded', ''])
        }, (error) => {
            debugger;
            self.$rootScope.appEvent('alert-error', ['Incident Action Error', error]);
        })
    }


    bosunRequest(data) {
        if (this.authToken) {
            data.headers = {
                "X-Access-Token": this.authToken
            };
        }
        return this.backendSrv.datasourceRequest(data);
    }

    // Required
    // Used for testing datasource in datasource configuration pange
    testDatasource() {
        return this.bosunRequest({
            url: this.url + '/',
            method: 'GET',
        }).then(response => {
            if (response.status === 200) {
                return { status: "success", message: "Data source is working", title: "Success" };
            }
        });
    }
}


