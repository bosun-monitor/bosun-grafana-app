import {QueryCtrl} from 'app/plugins/sdk';
import './css/query-editor.css!'

export class BosunDatasourceQueryCtrl extends QueryCtrl {

  constructor($scope, $injector, uiSegmentSrv)  {
    //debugger;
    super($scope, $injector);

    this.scope = $scope;
    this.uiSegmentSrv = uiSegmentSrv;
    this.target.target = this.target.target || 'Bosun Query';
  }

  getOptions() {
    return this.datasource.metricFindQuery(this.target)
      .then(this.uiSegmentSrv.transformToSegments(false));
      // Options have to be transformed by uiSegmentSrv to be usable by metric-segment-model directive
  }

  onChangeInternal() {
    this.panelCtrl.refresh(); // Asks the panel to refresh data.
  }
}

BosunDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';
