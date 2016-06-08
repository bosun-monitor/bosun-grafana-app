class BosunIncidentListPanelEditorCtrl {
    constructor($scope, $rootScope, $q, uiSegmentSrv, datasourceSrv, templateSrv) {
        $scope.editor = this;
        this.panelCtrl = $scope.ctrl;
        this.panel = this.panelCtrl.panel;
        this.$q = $q;

        var self = this;
        this.datasourceSrv = datasourceSrv;
        var datasources = _.filter(this.datasourceSrv.getMetricSources(), datasource => {
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
    }

    datasourceChanged() {
        this.panelCtrl.refresh();
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