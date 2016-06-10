'use strict';

System.register(['lodash', 'moment', 'app/plugins/sdk', './editor'], function (_export, _context) {
    var _, moment, MetricsPanelCtrl, bosunIncidentListPanelEditor, _createClass, statusMap, BosunIncidentListCtrl;

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
        }, function (_moment) {
            moment = _moment.default;
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

                function BosunIncidentListCtrl($scope, $injector, $rootScope, $window, datasourceSrv, templateSrv, utilSrv, backendSrv, dashboardSrv) {
                    _classCallCheck(this, BosunIncidentListCtrl);

                    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(BosunIncidentListCtrl).call(this, $scope, $injector));

                    var self = _this;
                    _this.panelCtrl = $scope.ctrl;
                    _this.datasourceSrv = datasourceSrv;
                    _this.$window = $window;
                    _this.templateSrv = templateSrv;
                    _this.$rootScope = $rootScope;
                    _this.linkUrl = "";
                    _this.incidentList = [];
                    _this.refreshData = _this.refreshData.bind(_this);
                    _this.refreshData();
                    _this.utilSrv = utilSrv;
                    _this.bodyHTML = "";
                    _this.reversedFields = {};
                    _this.showHelp = 0;
                    _this.storeId = dashboardSrv.currentDashboard.id + "-" + _this.panel.id;
                    backendSrv.get('/api/user').then(function (user) {
                        _this.user = user;
                    });
                    return _this;
                }

                _createClass(BosunIncidentListCtrl, [{
                    key: 'onInitMetricsPanelEditMode',
                    value: function onInitMetricsPanelEditMode() {
                        this.fullscreen = true;
                        this.addEditorTab('Options', bosunIncidentListPanelEditor, 2);
                    }
                }, {
                    key: 'refresh',
                    value: function refresh() {
                        this.onMetricsPanelRefresh();
                    }
                }, {
                    key: 'getSort',
                    value: function getSort() {
                        return this.$window.sessionStorage.getItem(this.storeId + "sort");
                    }
                }, {
                    key: 'setSort',
                    value: function setSort(type, field, rev) {
                        this.$window.sessionStorage.setItem(this.storeId + "sort", [type, field, rev].join(":"));
                    }
                }, {
                    key: 'callSort',
                    value: function callSort() {
                        var sortSpec = this.getSort();
                        if (!sortSpec || sortSpec == "") {
                            return;
                        }
                        // Property, Type, Reverse?
                        var split = sortSpec.split(":");
                        this.reversedFields[split[0]] = split[2] == "true";
                        if (split[1] == "status") {
                            this.sortIncidentsByStatus(split[0], true);
                        }
                        if (split[1] == "alpha") {
                            this.sortIncidents(split[0], true);
                        }
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
                    value: function sortIncidents(property, noswap) {
                        this.incidentList = _.sortBy(this.incidentList, 'Id');
                        this.incidentList = _.sortBy(this.incidentList, property);
                        if (!noswap) {
                            this.reversedFields[property] = this.reversedFields[property] == false;
                        }
                        this.setSort(property, "alpha", this.reversedFields[property]);
                        if (this.reversedFields[property] == true) {
                            this.incidentList.reverse();
                        }
                    }
                }, {
                    key: 'sortIncidentsByStatus',
                    value: function sortIncidentsByStatus(property, noswap) {
                        this.incidentList = _.sortBy(this.incidentList, 'Id');
                        this.incidentList = _.sortBy(this.incidentList, function (incident) {
                            return statusMap[incident[property]];
                        });
                        if (!noswap) {
                            this.reversedFields[property] = this.reversedFields[property] == false;
                        }
                        this.setSort(property, "status", this.reversedFields[property]);
                        if (this.reversedFields[property] == true) {
                            this.incidentList.reverse();
                        }
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
                                    item.bodyHTML = "";
                                    return item;
                                });
                                that.incidentList = data;
                                that.callSort();
                            });
                        });
                    }
                }, {
                    key: 'fmtTime',
                    value: function fmtTime(unixTS, relativeOnly) {
                        var m = moment.unix(unixTS);
                        var relative = '(' + m.fromNow() + ')';
                        if (relativeOnly) {
                            return relative;
                        }
                        return m.format('YYYY-MM-DD HH:mm:ss ') + relative;
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
                }, {
                    key: 'showActions',
                    value: function showActions(incident) {
                        var modalScope = this.$scope.$new();
                        modalScope.actions = incident.Actions;
                        this.utilSrv.showModal(undefined, {
                            src: "public/plugins/bosun-app/panels/incident-list/modal_actions.html",
                            scope: modalScope
                        });
                    }
                }, {
                    key: 'showEvents',
                    value: function showEvents(incident) {
                        var modalScope = this.$scope.$new();
                        modalScope.events = incident.Events.reverse();
                        this.utilSrv.showModal(undefined, {
                            src: "public/plugins/bosun-app/panels/incident-list/modal_events.html",
                            scope: modalScope
                        });
                    }
                }, {
                    key: 'multiAction',
                    value: function multiAction() {
                        if (!this.selectedMultiAction) {
                            return;
                        }
                        var incidents = _.filter(this.incidentList, function (incident) {
                            return incident.selected == true;
                        });
                        if (incidents.length == 0) {
                            return;
                        }
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;

                        try {
                            for (var _iterator = incidents[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var i = _step.value;

                                if (this.selectedMultiAction == "forget") {
                                    if (i.CurrentStatus != "unknown") {
                                        this.$rootScope.appEvent('alert-error', ["Action Error", 'can not forget an alert that is not currently unknown: ' + i.AlertName + i.TagsString]);
                                        return;
                                    }
                                }
                                if (this.selectedMultiAction == "close") {
                                    if (i.CurrentStatus != "normal") {
                                        this.$rootScope.appEvent('alert-error', ["Action Error", 'can not close an alert that is not currently normal: ' + i.AlertName + i.TagsString]);
                                        return;
                                    }
                                }
                                if (this.selectedMultiAction == "ack") {
                                    if (!i.NeedAck) {
                                        this.$rootScope.appEvent('alert-error', ["Action Error", 'can not ack an alert that is already acknowledged: ' + i.AlertName + i.TagsString]);
                                        return;
                                    }
                                }
                            }
                        } catch (err) {
                            _didIteratorError = true;
                            _iteratorError = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion && _iterator.return) {
                                    _iterator.return();
                                }
                            } finally {
                                if (_didIteratorError) {
                                    throw _iteratorError;
                                }
                            }
                        }

                        this.showActionForm(incidents, this.selectedMultiAction);
                    }
                }, {
                    key: 'showActionForm',
                    value: function showActionForm(incidents, action) {
                        if (!Array.isArray(incidents)) {
                            incidents = [incidents];
                        }
                        var modalScope = this.$scope.$new();
                        modalScope.incidents = incidents;
                        modalScope.action = action;
                        this.utilSrv.showModal(undefined, {
                            src: "public/plugins/bosun-app/panels/incident-list/modal_action.html",
                            scope: modalScope
                        });
                    }
                }, {
                    key: 'submitActionForm',
                    value: function submitActionForm(incidents, action) {
                        var self = this;
                        if (!this.actionForm) {
                            self.$rootScope.appEvent('alert-error', ['Action Error', 'must fill out form fields']);
                        }
                        var actionForm = this.actionForm;
                        var actionRequest = {
                            Type: action,
                            User: actionForm.User,
                            Message: actionForm.Message,
                            Notify: actionForm.Notify == true
                        };
                        actionRequest.Keys = _.map(incidents, function (incident) {
                            return incident.AlertName + incident.TagsString;
                        });
                        this.datasourceSrv.get(this.panel.datasource).then(function (datasource) {
                            datasource.submitAction(actionRequest).then(function () {
                                return self.refreshData().then();
                            });
                        });
                    }
                }, {
                    key: 'showBody',
                    value: function showBody(incident) {
                        var _this2 = this;

                        this.datasourceSrv.get(this.panel.datasource).then(function (datasource) {
                            datasource.AlertBodyHTML(incident.AlertName + incident.TagsString).then(function (data) {
                                var modalScope = _this2.$rootScope.$new();
                                modalScope.bodyHTML = data;
                                _this2.utilSrv.showModal(undefined, {
                                    src: "public/plugins/bosun-app/panels/incident-list/modal_body.html",
                                    scope: modalScope
                                });
                            });
                        });
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
