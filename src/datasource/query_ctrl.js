import {QueryCtrl} from 'app/plugins/sdk';
import './css/query-editor.css!'

export class BosunDatasourceQueryCtrl extends QueryCtrl {

  constructor($scope, $injector, uiSegmentSrv) {
    super($scope, $injector);
    this.scope = $scope;
    this.queryHelper = {};
    this.uiSegmentSrv = uiSegmentSrv;
    this.target.expandHelper = 0;
    this.target.target = this.target.target || 'Bosun Query';
    this.suggestMetrics = this.suggestMetrics.bind(this);
    this.addSuggest = this.addSuggest.bind(this);
    this.labelFromUnit = this.labelFromUnit.bind(this);
    this.metricInfo = this.metricInfo.bind(this);
    this.suggestQuery = this.suggestQuery.bind(this);
    this.suggestTagValues = this.suggestTagValues.bind(this);
    this.filterTypes = ["Group By", "Filter"]
  }

  suggestMetrics(metric, callback) {
    return this.datasource._metricsStartWith(metric).then(callback);
  }

  metricInfo() {
    return this.datasource._tagKeysForMetric(this.queryHelper.metric).then((tagKeys) => {
      this.datasource.q.all(_.map(tagKeys, (tagKey) => {
        return this.datasource._tagValuesForMetricAndTagKey(this.queryHelper.metric, tagKey).then((tagValues) => {
          return { key: tagKey, value: tagValues }
        })
      })
      ).then((tagKeysToValues) => {
        tagKeysToValues = _.each(tagKeysToValues, (v) => { v.filterType = "Group By" })
        this.queryHelper.tagKeysToValues = tagKeysToValues;
      })
    }).then(() => this.datasource._metricMetadata(this.queryHelper.metric).then((metadata) => {
      this.queryHelper.rate = metadata.Rate;
      this.queryHelper.unit = metadata.Unit;
      this.queryHelper.desc = metadata.Desc;
    })).then(() => this.suggestQuery());
  }

  // Expects that getTags has been called
  suggestTagValues(key, callback) {
    return this.queryHelper.tagKeysToValues[key].then(callback)
  }

  labelFromUnit() {
    if (this.panelCtrl.panel.type === "graph") {
      this.panelCtrl.panel.yaxes[0].label = this.queryHelper.unit;
    }
    if (this.panelCtrl.panel.type === "singlestat") {
      this.panelCtrl.panel.postfix = " " + this.queryHelper.unit;
    }
  }

  suggestQuery() {
    var metric = this.queryHelper.metric || "metric.goes.here";
    var selectedGroupByTags = [];
    var selectedFilterTags = [];
    _.each(this.queryHelper.tagKeysToValues, (v) => {
      if (v.selectedValue && v.selectedValue != "") {
        if (v.filterType === this.filterTypes[0]) {
          selectedGroupByTags.push(v.key + "=" + v.selectedValue);
        }
        if (v.filterType === this.filterTypes[1]) {
          selectedFilterTags.push(v.key + "=" + v.selectedValue);
        }
      }
    }, this);
    var rate = "";
    if (this.queryHelper.rate && this.queryHelper.rate == "counter") {
      rate = "rate{counter,,1}:"
    }
    this.queryHelper.suggestedQuery = "q(\"avg:$ds-avg:" + rate + metric + "{" + selectedGroupByTags.join(",") + "}" + "{" + selectedFilterTags.join(",") + "}" + "\", \"$start\", \"\")"
  }

  onChangeInternal() {
    this.panelCtrl.refresh(); // Asks the panel to refresh data.
  }

  addSuggest() {
    if (this.target.expr) {
      this.target.expr += "\n" + this.queryHelper.suggestedQuery;
    } else {
      this.target.expr = this.queryHelper.suggestedQuery;
    }
  }
}

BosunDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';
