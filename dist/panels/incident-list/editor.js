'use strict';

System.register([], function (_export, _context) {
    var BosunIncidentListPanelEditorCtrl;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    return {
        setters: [],
        execute: function () {
            BosunIncidentListPanelEditorCtrl = function BosunIncidentListPanelEditorCtrl($scope, $rootScope, $q, uiSegmentSrv, datasourceSrv, templateSrv) {
                _classCallCheck(this, BosunIncidentListPanelEditorCtrl);

                $scope.editor = this;
                this.panelCtrl = $scope.ctrl;
                this.panel = this.panelCtrl.panel;

                this.$q = $q;
                this.datasourceSrv = datasourceSrv;
                this.templateSrv = templateSrv;
            };

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
