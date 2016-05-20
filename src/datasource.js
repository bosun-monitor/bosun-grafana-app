import TableModel from 'app/core/table_model';

export class BosunDatasource {
    constructor(instanceSettings, $q, backendSrv, templateSrv) {
        this.type = instanceSettings.type;
        this.url = instanceSettings.url;
        this.name = instanceSettings.name;
        this.q = $q;
        this.backendSrv = backendSrv;
        this.templateSrv = templateSrv;
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
        return this.backendSrv.datasourceRequest({
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
                return { data: result };
            }
        });
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

            query = this.templateSrv.replace(target.expr, options.scopedVars);
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

    // Required
    // Used for testing datasource in datasource configuration pange
    testDatasource() {
        return this.backendSrv.datasourceRequest({
            url: this.url + '/',
            method: 'GET'
        }).then(response => {
            if (response.status === 200) {
                return { status: "success", message: "Data source is working", title: "Success" };
            }
        });
    }
}

