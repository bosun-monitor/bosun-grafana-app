"use strict";

System.register(["app/core/table_model"], function (_export, _context) {
    var TableModel, _createClass, BosunDatasource;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    return {
        setters: [function (_appCoreTable_model) {
            TableModel = _appCoreTable_model.default;
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

            _export("BosunDatasource", BosunDatasource = function () {
                function BosunDatasource(instanceSettings, $q, backendSrv, templateSrv) {
                    _classCallCheck(this, BosunDatasource);

                    this.type = instanceSettings.type;
                    this.url = instanceSettings.url;
                    this.name = instanceSettings.name;
                    this.q = $q;
                    this.backendSrv = backendSrv;
                    this.templateSrv = templateSrv;
                }

                _createClass(BosunDatasource, [{
                    key: "makeTable",
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
                    key: "transformMetricData",
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
                    key: "performTimeSeriesQuery",
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
                    key: "_metricsStartWith",
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
                    key: "_tagKeysForMetric",
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
                    key: "_tagValuesForMetricAndTagKey",
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
                    key: "metricFindQuery",
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
                    key: "query",
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
                    key: "testDatasource",
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

            _export("BosunDatasource", BosunDatasource);
        }
    };
});
//# sourceMappingURL=datasource.js.map
