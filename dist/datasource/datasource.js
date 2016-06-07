'use strict';

System.register(['app/core/table_model', 'moment'], function (_export, _context) {
    var TableModel, moment, _createClass, BosunDatasource;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    return {
        setters: [function (_appCoreTable_model) {
            TableModel = _appCoreTable_model.default;
        }, function (_moment) {
            moment = _moment.default;
        }],
        execute: function () {
            _createClass = function () {
                function defineProperties(target, props) {
                    for (var i = 0; i < props.length; i++) {
                        var descriptor = props[i];
                        descriptor.enumerable = descriptor.enumerable || false;
                        descriptor.configurable = true;
                        if ("value" in descriptor) descriptor.writable = true;
                        Object.defineProperty(target, descriptor.key, descriptor);
                    }
                }

                return function (Constructor, protoProps, staticProps) {
                    if (protoProps) defineProperties(Constructor.prototype, protoProps);
                    if (staticProps) defineProperties(Constructor, staticProps);
                    return Constructor;
                };
            }();

            _export('BosunDatasource', BosunDatasource = function () {
                function BosunDatasource(instanceSettings, $q, backendSrv, templateSrv, $sce, $rootScope) {
                    _classCallCheck(this, BosunDatasource);

                    this.annotateUrl = instanceSettings.jsonData.annotateUrl;
                    this.type = instanceSettings.type;
                    this.url = instanceSettings.url;
                    this.name = instanceSettings.name;
                    this.showHelper = instanceSettings.jsonData.enableQueryHelper;
                    this.q = $q;
                    this.backendSrv = backendSrv;
                    this.templateSrv = templateSrv;
                    this.sce = $sce;
                    this.$rootScope = $rootScope;
                    this.IncidentListQuery = this.IncidentListQuery.bind(this);
                }

                _createClass(BosunDatasource, [{
                    key: 'makeTable',
                    value: function makeTable(result) {
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
                }, {
                    key: 'transformMetricData',
                    value: function transformMetricData(result, target, options) {
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
                }, {
                    key: 'performTimeSeriesQuery',
                    value: function performTimeSeriesQuery(query, target, options) {
                        var exprDate = options.range.to.utc().format('YYYY-MM-DD');
                        var exprTime = options.range.to.utc().format('HH:mm:ss');
                        var url = this.url + '/api/expr?date=' + encodeURIComponent(exprDate) + '&time=' + encodeURIComponent(exprTime);
                        return this.backendSrv.datasourceRequest({
                            url: url,
                            method: 'POST',
                            data: query,
                            datasource: this
                        }).then(function (response) {
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
                                return { data: result };
                            }
                        });
                    }
                }, {
                    key: '_metricsStartWith',
                    value: function _metricsStartWith(metricRoot) {
                        return this.backendSrv.datasourceRequest({
                            url: this.url + "/api/metric",
                            method: 'GET',
                            datasource: this
                        }).then(function (data) {
                            var filtered = _.filter(data.data, function (v) {
                                return v.startsWith(metricRoot);
                            });
                            return filtered;
                        });
                    }
                }, {
                    key: '_tagKeysForMetric',
                    value: function _tagKeysForMetric(metric) {
                        return this.backendSrv.datasourceRequest({
                            url: this.url + "/api/tagk/" + metric,
                            method: 'GET',
                            datasource: this
                        }).then(function (data) {
                            return data.data;
                        });
                    }
                }, {
                    key: '_tagValuesForMetricAndTagKey',
                    value: function _tagValuesForMetricAndTagKey(metric, key) {
                        return this.backendSrv.datasourceRequest({
                            url: this.url + "/api/tagv/" + key + "/" + metric,
                            method: 'GET',
                            datasource: this
                        }).then(function (data) {
                            return data.data;
                        });
                    }
                }, {
                    key: '_metricMetadata',
                    value: function _metricMetadata(metric) {
                        return this.backendSrv.datasourceRequest({
                            url: this.url + "/api/metadata/metrics?metric=" + metric,
                            method: 'GET',
                            datasource: this
                        }).then(function (data) {
                            return data.data;
                        });
                    }
                }, {
                    key: 'metricFindQuery',
                    value: function metricFindQuery(query) {
                        var findTransform = function findTransform(result) {
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

                        var metricsQuery = query.match(metricsRegex);
                        if (metricsQuery) {
                            return this._metricsStartWith(metricsQuery[1]).then(findTransform);
                        }

                        var tagKeysQuery = query.match(tagKeysRegex);
                        if (tagKeysQuery) {
                            return this._tagKeysForMetric(tagKeysQuery[1]).then(findTransform);
                        }

                        var tagValuesQuery = query.match(tagValuesRegex);
                        if (tagValuesQuery) {
                            return this._tagValuesForMetricAndTagKey(tagValuesQuery[1].trim(), tagValuesQuery[2].trim()).then(findTransform);
                        }

                        return this.q.when([]);
                    }
                }, {
                    key: 'query',
                    value: function query(options) {
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

                        return this.q.all(allQueryPromise).then(function (allResponse) {
                            var result = [];
                            _.each(allResponse, function (response) {
                                _.each(response.data, function (d) {
                                    result.push(d);
                                });
                            });
                            return { data: result };
                        });
                    }
                }, {
                    key: '_processAnnotationQueryParam',
                    value: function _processAnnotationQueryParam(annotation, fieldName, fieldObject, params) {
                        var param = {};
                        var key = fieldName;
                        if (!fieldObject) {
                            return params;
                        }
                        if (fieldObject.empty) {
                            key += ":Empty";
                        }
                        if (fieldObject.not) {
                            if (!fieldObject.empty) {
                                key += ":";
                            }
                            key += ":Empty";
                        }
                        params[key] = fieldObject.value;
                        return params;
                    }
                }, {
                    key: 'annotationQuery',
                    value: function annotationQuery(options) {
                        var annotation = options.annotation;
                        var params = {};
                        params.StartDate = options.range.from.unix();
                        params.EndDate = options.range.to.unix();
                        params = this._processAnnotationQueryParam(annotation, "Source", annotation.Source, params);
                        params = this._processAnnotationQueryParam(annotation, "Host", annotation.Host, params);
                        params = this._processAnnotationQueryParam(annotation, "CreationUser", annotation.CreationUser, params);
                        params = this._processAnnotationQueryParam(annotation, "Owner", annotation.Owner, params);
                        params = this._processAnnotationQueryParam(annotation, "Category", annotation.Category, params);
                        params = this._processAnnotationQueryParam(annotation, "Url", annotation.Url, params);
                        var url = this.url + '/api/annotation/query?';
                        if (Object.keys(params).length > 0) {
                            url += jQuery.param(params);
                        }
                        var rawUrl = this.rawUrl;
                        return this.backendSrv.datasourceRequest({
                            url: url,
                            method: 'GET',
                            datasource: this
                        }).then(function (response) {
                            if (response.status === 200) {
                                var events = [];
                                _.each(response.data, function (a) {
                                    var text = [];
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
                                        text.push("Host: " + a.Owner);
                                    }
                                    if (a.Url) {
                                        text.push('<a href="' + a.Url + '">' + a.Url.substring(0, 50) + '</a>');
                                    }
                                    if (a.Message) {
                                        text.push(a.Message);
                                    }
                                    var grafanaAnnotation = {
                                        annotation: annotation,
                                        time: moment(a.StartDate).utc().unix() * 1000,
                                        title: a.Category,
                                        text: text.join("<br>")
                                    };
                                    events.push(grafanaAnnotation);
                                });
                                return events;
                            }
                        });
                    }
                }, {
                    key: '_plainTextResponseTransform',
                    value: function _plainTextResponseTransform(data, headers) {
                        if (headers("content-type").includes("text/plain")) {
                            return { message: data };
                        }
                        return angular.fromJson(data);
                    }
                }, {
                    key: 'IncidentListQuery',
                    value: function IncidentListQuery(query) {
                        var self = this;
                        return this.backendSrv.datasourceRequest({
                            url: this.url + '/api/incidents/open?filter=' + encodeURIComponent(query),
                            method: 'GET',
                            transformResponse: this._plainTextResponseTransform
                        }).then(function (response) {
                            if (response.status === 200) {
                                return response.data;
                            }
                        }, function (error) {
                            self.$rootScope.appEvent('alert-error', ['IncidentListQuery Error', error.data.message]);
                        });
                    }
                }, {
                    key: 'AlertBodyHTML',
                    value: function AlertBodyHTML(alertKey) {
                        var _this = this;

                        return this.backendSrv.datasourceRequest({
                            url: this.url + '/api/status?ak=' + encodeURIComponent(alertKey),
                            method: 'GET'
                        }).then(function (response) {
                            if (response.status === 200) {
                                return _this.sce.trustAsHtml(response.data[alertKey].Body);
                            }
                        });
                    }
                }, {
                    key: 'submitAction',
                    value: function submitAction(actionObj) {
                        var self = this;
                        return this.backendSrv.datasourceRequest({
                            url: this.url + '/api/action',
                            method: 'POST',
                            data: actionObj,
                            datasource: this,
                            transformResponse: this._plainTextResponseTransform
                        }).then(function (data) {
                            self.$rootScope.appEvent('alert-success', ['Incident Action Succeeded', '']);
                        }, function (error) {
                            self.$rootScope.appEvent('alert-error', ['Incident Action Error', error.data.message]);
                        });
                    }
                }, {
                    key: 'testDatasource',
                    value: function testDatasource() {
                        return this.backendSrv.datasourceRequest({
                            url: this.url + '/',
                            method: 'GET'
                        }).then(function (response) {
                            if (response.status === 200) {
                                return { status: "success", message: "Data source is working", title: "Success" };
                            }
                        });
                    }
                }]);

                return BosunDatasource;
            }());

            _export('BosunDatasource', BosunDatasource);
        }
    };
});
//# sourceMappingURL=datasource.js.map
