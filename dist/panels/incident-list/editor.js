'use strict';

System.register([], function (_export, _context) {
    "use strict";

    var _createClass, BosunIncidentListPanelEditorCtrl;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    return {
        setters: [],
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

            BosunIncidentListPanelEditorCtrl = function () {
                function BosunIncidentListPanelEditorCtrl($scope, $rootScope, $q, uiSegmentSrv, datasourceSrv, templateSrv) {
                    _classCallCheck(this, BosunIncidentListPanelEditorCtrl);

                    $scope.editor = this;
                    this.panelCtrl = $scope.ctrl;
                    this.panel = this.panelCtrl.panel;
                    this.$q = $q;
                    var self = this;
                    this.datasourceSrv = datasourceSrv;
                    var datasources = _.filter(this.datasourceSrv.getMetricSources(), function (datasource) {
                        return datasource.meta.id === 'bosun-datasource';
                    });
                    this.datasources = _.map(datasources, 'name');
                    if (!this.panel.datasource) {
                        this.panel.datasource = this.datasources[0];
                    }
                    this.datasourceSrv.get(this.panel.datasource).then(function (datasource) {
                        self.datasource = datasource;
                        self.panelCtrl.refresh();
                    });
                    this.templateSrv = templateSrv;
                    this.panel.showMutli = this.panel.showMutli;
                }

                _createClass(BosunIncidentListPanelEditorCtrl, [{
                    key: 'datasourceChanged',
                    value: function datasourceChanged() {
                        this.panelCtrl.refresh();
                    }
                }]);

                return BosunIncidentListPanelEditorCtrl;
            }();

            function bosunIncidentListPanelEditor() {
                return {
                    restrict: 'E',
                    scope: true,
                    templateUrl: 'public/plugins/bosun-app/panels/incident-list/editor.html',
                    controller: BosunIncidentListPanelEditorCtrl
                };
            }

            _export('bosunIncidentListPanelEditor', bosunIncidentListPanelEditor);
        }
    };
});
//# sourceMappingURL=editor.js.map
