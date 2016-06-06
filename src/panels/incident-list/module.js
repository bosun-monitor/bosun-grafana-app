import _ from 'lodash';
import moment from 'moment';
import {MetricsPanelCtrl} from 'app/plugins/sdk';
import {bosunIncidentListPanelEditor} from './editor';

var statusMap = {
    "normal": 0,
    "warning": 1,
    "critical": 2,
    "unknown": 3
}

export class BosunIncidentListCtrl extends MetricsPanelCtrl {
    constructor($scope, $injector, $rootScope, datasourceSrv, templateSrv, utilSrv) {
        super($scope, $injector);
        this.datasourceSrv = datasourceSrv;
        this.templateSrv = templateSrv;
        this.linkUrl = "";
        this.incidentList = [];
        //debugger;
        this.refreshData();
        this.utilSrv = utilSrv;
        this.bodyHTML = ""
        //this.utilSrv.init();
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

    sortIncidents(property) {
        this.incidentList = _.sortBy(this.incidentList, property)
    }

    sortIncidentsByStatus(property) {
        this.incidentList = _.sortBy(this.incidentList, (incident) => {
            return statusMap[incident[property]];
        }).reverse();
    }

    refreshData() {
        var query = this.panel.query;
        var that = this;
        return this.datasourceSrv.get(this.panel.datasource)
            .then(datasource => {
                datasource.IncidentListQuery(query).then((data) => {
                    data = _.each(data, (item) => {
                        item.incidentLink = datasource.annotateUrl + "/incident?id=" + item.Id;
                        item.ackLink = datasource.annotateUrl + "/action?type=ack&key=" + encodeURIComponent(item.AlertName + item.TagsString);
                        item.closeLink = datasource.annotateUrl + "/action?type=close&key=" + encodeURIComponent(item.AlertName + item.TagsString);
                        item.forgetLink = datasource.annotateUrl + "/action?type=forget&key=" + encodeURIComponent(item.AlertName + item.TagsString);
                        item.bodyHTML = "";
                        return item;
                    })
                    that.incidentList = data;
                })
            });
    }
    
    fmtTime(unixTS) {
        return moment.unix(unixTS).format('YYYY-MM-DD HH:mm:ss');
    }
    
    modalTest() {
        //var modalScope = this.$scope.$new(true);
        //modalScope.plugin = this.model;
        // thi
        this.utilSrv.showModal(event, {src: "public/plugins/bosun-app/panels/incident-list/modal.html", scope:  this.$scope.$new()})
    }

    statusClass(prefix, status) {
        switch (status) {
            case "critical": return prefix + "error";
            case "unknown": return prefix + "info";
            case "warning": return prefix + "warning";
            case "normal": return prefix + "success";
            default: return prefix + "error";
        }
    };

    showActions(incident) {
        incident.showActions = !incident.showActions;
    }
    
    showEvents(incident) {
        incident.showEvents = !incident.showEvents;
    }

    showBody(incident) {
        this.datasourceSrv.get(this.panel.datasource).
            then(datasource => {
                datasource.AlertBodyHTML(incident.AlertName + incident.TagsString).then(data => {
                    console.log(this)
                    this.bodyHTML = data;
                    this.utilSrv.showModal(event, {src: "public/plugins/bosun-app/panels/incident-list/modal.html", scope:  this.$scope.$new()})
                })
            });
    }
}

BosunIncidentListCtrl.templateUrl = 'panels/incident-list/module.html';

export {
BosunIncidentListCtrl,
BosunIncidentListCtrl as PanelCtrl
};