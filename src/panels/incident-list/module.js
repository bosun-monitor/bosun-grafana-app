import _ from 'lodash';
import {MetricsPanelCtrl} from 'app/plugins/sdk';
import {bosunIncidentListPanelEditor} from './editor';

export class BosunIncidentListCtrl extends MetricsPanelCtrl {
    constructor($scope, $injector, $rootScope, datasourceSrv, templateSrv) {
        super($scope, $injector);
        this.datasourceSrv = datasourceSrv;
        this.templateSrv = templateSrv;

        this.incidentList = [];
        this.refreshData();
    }

    onInitMetricsPanelEditMode() {
        this.addEditorTab('Options', bosunIncidentListPanelEditor, 2);
    }

    refresh() {
        this.onMetricsPanelRefresh();
    }

    onMetricsPanelRefresh() {
        // ignore fetching data if another panel is in fullscreen
        if (this.otherPanelInFullscreenMode()) { return; }
        this.refreshData();
    }

    refreshData() {
        return this.datasourceSrv.get(this.panel.datasource).then(() => {
            this.incidentList = ["foo"];
        });
    }
}

BosunIncidentListCtrl.templateUrl = 'panels/incident-list/module.html';

export {
BosunIncidentListCtrl,
BosunIncidentListCtrl as PanelCtrl
};