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
        this.$rootScope = $rootScope;
        this.linkUrl = "";
        this.incidentList = [];
        //debugger;
        this.refreshData = this.refreshData.bind(this);
        this.refreshData();
        this.utilSrv = utilSrv;
        this.bodyHTML = "";
        this.reversedFields = {};
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

    sortIncidents(property, reverse) {
        this.incidentList = _.sortBy(this.incidentList, property)
        this.reversedFields[property] = this.reversedFields[property] == false;
        if (this.reversedFields[property]) {
            this.incidentList.reverse()
        }
    }

    sortIncidentsByStatus(property) {
        this.incidentList = _.sortBy(this.incidentList, (incident) => {
            return statusMap[incident[property]];
        });
        
        this.reversedFields[property] = this.reversedFields[property] == false;
        if (this.reversedFields[property]) {
            this.incidentList.reverse()
        }
    }

    refreshData() {
        var query = this.panel.query;
        var that = this;
        return this.datasourceSrv.get(this.panel.datasource)
            .then(datasource => {
                datasource.IncidentListQuery(query).then((data) => {
                    data = _.each(data, (item) => {
                        item.incidentLink = datasource.annotateUrl + "/incident?id=" + item.Id;
                        item.bodyHTML = "";
                        return item;
                    })
                    that.incidentList = data;
                })
            });
    }

    fmtTime(unixTS, relativeOnly) {
        var m = moment.unix(unixTS);
        var relative = '(' + m.fromNow() + ')'
        if (relativeOnly) {
            return relative;
        }
        return m.format('YYYY-MM-DD HH:mm:ss ') + relative;
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
        var modalScope = this.$scope.$new();
        modalScope.actions = incident.Actions;
        this.utilSrv.showModal(event, {
            src: "public/plugins/bosun-app/panels/incident-list/modal_actions.html",
            scope: modalScope
        });
    }

    showEvents(incident) {
        var modalScope = this.$scope.$new();
        modalScope.events = incident.Events.reverse();
        this.utilSrv.showModal(event, {
            src: "public/plugins/bosun-app/panels/incident-list/modal_events.html",
            scope: modalScope
        });
    }

    multiAction() {
        if (!this.selectedMultiAction) {
            return
        }
        var incidents = _.filter(this.incidentList, (incident) => {
            return incident.selected == true;
        })
        if (incidents.length == 0) {
            return
        }
        this.showActionForm(incidents, this.selectedMultiAction)
    }

    // incidents can be an incident, but also an [] of incidents    
    showActionForm(incidents, action) {
        if (!Array.isArray(incidents)) {
            incidents = [incidents]
        }
        var modalScope = this.$scope.$new();
        modalScope.incidents = incidents;
        modalScope.action = action;
        this.utilSrv.showModal(event, {
            src: "public/plugins/bosun-app/panels/incident-list/modal_action.html",
            scope: modalScope
        });
    }

    submitActionForm(incidents, action) {
        var self = this;
        var actionForm = this.actionForm;
        var actionRequest = {
            Type: action,
            User: actionForm.User,
            Message: actionForm.Message,
            Notify: actionForm.Notify == true,
        }
        actionRequest.Keys = _.map(incidents, (incident) => {
            return incident.AlertName + incident.TagsString;
        });
        this.datasourceSrv.get(this.panel.datasource).
            then(datasource => {
                datasource.submitAction(actionRequest).then(() =>
                    self.refreshData().then()
                )
            })
    }


    showBody(incident) {
        this.datasourceSrv.get(this.panel.datasource).
            then(datasource => {
                datasource.AlertBodyHTML(incident.AlertName + incident.TagsString).then(data => {
                    var modalScope = this.$rootScope.$new();
                    modalScope.bodyHTML = data;
                    this.utilSrv.showModal(event, {
                        src: "public/plugins/bosun-app/panels/incident-list/modal_body.html",
                        scope: modalScope
                    });
                })
            });
    }
}

BosunIncidentListCtrl.templateUrl = 'panels/incident-list/module.html';

export {
BosunIncidentListCtrl,
BosunIncidentListCtrl as PanelCtrl
};