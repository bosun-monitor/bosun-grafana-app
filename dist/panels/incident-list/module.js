'use strict';

System.register(['lodash', 'app/plugins/sdk', './editor'], function (_export, _context) {
    var _, MetricsPanelCtrl, bosunIncidentListPanelEditor, _createClass, statusMap, BosunIncidentListCtrl;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        }

        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    return {
        setters: [function (_lodash) {
            _ = _lodash.default;
        }, function (_appPluginsSdk) {
            MetricsPanelCtrl = _appPluginsSdk.MetricsPanelCtrl;
        }, function (_editor) {
            bosunIncidentListPanelEditor = _editor.bosunIncidentListPanelEditor;
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

            statusMap = {
                "normal": 0,
                "warning": 1,
                "critical": 2,
                "unknown": 3
            };

            _export('PanelCtrl', _export('BosunIncidentListCtrl', _export('BosunIncidentListCtrl', BosunIncidentListCtrl = function (_MetricsPanelCtrl) {
                _inherits(BosunIncidentListCtrl, _MetricsPanelCtrl);

                function BosunIncidentListCtrl($scope, $injector, $rootScope, datasourceSrv, templateSrv) {
                    _classCallCheck(this, BosunIncidentListCtrl);

                    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(BosunIncidentListCtrl).call(this, $scope, $injector));

                    _this.datasourceSrv = datasourceSrv;
                    _this.templateSrv = templateSrv;
                    _this.linkUrl = "";
                    _this.incidentList = [];
                    //debugger;
                    _this.refreshData();
                    return _this;
                }

                _createClass(BosunIncidentListCtrl, [{
                    key: 'onInitMetricsPanelEditMode',
                    value: function onInitMetricsPanelEditMode() {
                        this.addEditorTab('Options', bosunIncidentListPanelEditor, 2);
                    }
                }, {
                    key: 'refresh',
                    value: function refresh() {
                        this.onMetricsPanelRefresh();
                    }
                }, {
                    key: 'onMetricsPanelRefresh',
                    value: function onMetricsPanelRefresh() {
                        // ignore fetching data if another panel is in fullscreen
                        if (this.otherPanelInFullscreenMode()) {
                            return;
                        }
                        this.refreshData();
                    }
                }, {
                    key: 'sortIncidents',
                    value: function sortIncidents(property) {
                        this.incidentList = _.sortBy(this.incidentList, property);
                    }
                }, {
                    key: 'sortIncidentsByStatus',
                    value: function sortIncidentsByStatus(property) {
                        this.incidentList = _.sortBy(this.incidentList, function (incident) {
                            return statusMap[incident[property]];
                        }).reverse();
                    }
                }, {
                    key: 'refreshData',
                    value: function refreshData() {
                        var query = this.panel.query;
                        var that = this;
                        return this.datasourceSrv.get(this.panel.datasource).then(function (datasource) {
                            datasource.IncidentListQuery(query).then(function (data) {
                                data = _.each(data, function (item) {
                                    item.incidentLink = datasource.annotateUrl + "/incident?id=" + item.Id;
                                    item.ackLink = datasource.annotateUrl + "/action?type=ack&key=" + encodeURIComponent(item.AlertName + item.TagsString);
                                    item.closeLink = datasource.annotateUrl + "/action?type=close&key=" + encodeURIComponent(item.AlertName + item.TagsString);
                                    return item;
                                });
                                that.incidentList = data;
                            });
                        });
                    }
                }, {
                    key: 'statusClass',
                    value: function statusClass(prefix, status) {
                        switch (status) {
                            case "critical":
                                return prefix + "error";
                            case "unknown":
                                return prefix + "info";
                            case "warning":
                                return prefix + "warning";
                            case "normal":
                                return prefix + "success";
                            default:
                                return prefix + "error";
                        }
                    }
                }]);

                return BosunIncidentListCtrl;
            }(MetricsPanelCtrl))));

            _export('BosunIncidentListCtrl', BosunIncidentListCtrl);

            BosunIncidentListCtrl.templateUrl = 'panels/incident-list/module.html';

            _export('BosunIncidentListCtrl', BosunIncidentListCtrl);

            _export('PanelCtrl', BosunIncidentListCtrl);
        }
    };
});
//# sourceMappingURL=module.js.map
