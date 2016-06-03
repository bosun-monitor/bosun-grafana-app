class BosunIncidentListPanelEditorCtrl {
    constructor($scope, $rootScope, $q, uiSegmentSrv, datasourceSrv, templateSrv) {
        $scope.editor = this;
        this.panelCtrl = $scope.ctrl;
        this.panel = this.panelCtrl.panel;

        this.$q = $q;
        this.datasourceSrv = datasourceSrv;
        this.templateSrv = templateSrv;
    }
}

export function bosunIncidentListPanelEditor() {
    return {
        restrict: 'E',
        scope: true,
        templateUrl: 'public/plugins/bosun-app/panels/incident-list/editor.html',
        controller: BosunIncidentListPanelEditorCtrl,
    };
}