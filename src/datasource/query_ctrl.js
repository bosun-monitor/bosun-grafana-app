import {QueryCtrl} from 'app/plugins/sdk';
import './css/query-editor.css!';
import Sortable from './../external/Sortable.min';
import {substituteFinalQuery} from "./queryBuilderService";


export class BosunDatasourceQueryCtrl extends QueryCtrl {

  constructor($scope, $injector, uiSegmentSrv) {
    super($scope, $injector);
    this.scope = $scope;
    this.queryHelper = {};
    this.uiSegmentSrv = uiSegmentSrv;
    this.target.expandHelper = 0;
    this.target.target = this.target.target || 'Bosun Query';
    this.deleteVariable = this.deleteVariable.bind(this);
    this.suggestMetrics = this.suggestMetrics.bind(this);
    this.addSuggest = this.addSuggest.bind(this);
    this.labelFromUnit = this.labelFromUnit.bind(this);
    this.metricInfo = this.metricInfo.bind(this);
    this.suggestQuery = this.suggestQuery.bind(this);
    this.suggestTagValues = this.suggestTagValues.bind(this);
    this.addNewVariable = this.addNewVariable.bind(this);
    this.getMetricSuggestions = this.getMetricSuggestions.bind(this);
    this.addTagBox = this.addTagBox.bind(this);
    this.filterTypes = ["Group By", "Filter"];
    if (!this.target.variables) {
      this.target.variables = [];
    } else {
      this.target.variables = _.orderBy(this.target.variables, ['indexInUI'])
    }
    this.scope.aggOptions = [
      {text: 'avg'}, {text: 'count'}, {text: 'dev'}, {text: 'diff'}, {text: 'ep50r3'}, {text: 'ep50r7'},
      {text: 'ep75r3'}, {text: 'ep75r7'}, {text: 'ep90r3'}, {text: 'ep90r7'}, {text: 'ep95r3'}, {text: 'ep95r7'},
      {text: 'ep99r3'}, {text: 'ep99r7'}, {text: 'ep999r3'}, {text: 'ep999r7'}, {text: 'first'}, {text: 'last'},
      {text: 'median'}, {text: 'mimmin'}, {text: 'mimmax'}, {text: 'min'}, {text: 'max'}, {text: 'mult'},
      {text: 'none'}, {text: 'p50'}, {text: 'p75'}, {text: 'p90'}, {text: 'p95'}, {text: 'p99'}, {text: 'p999'},
      {text: 'pfsum'}, {text: 'sum'}, {text: 'zimsum'}
    ];
    this.scope.fillPolicies = [{text: 'none'}, {text: 'nan'}, {text: 'null'}, {text: 'zero'}];
    this.scope.queryFunctions = [
      {func: 'q', type: 'seriesSet', args: {'query': 'string', 'startDuration': 'string', 'endDuration': 'string'}},
      {
        func: 'band',
        type: 'seriesSet',
        args: {'query': 'string', 'duration': 'string', 'period': 'string', 'num': 'scalar'}
      },
      {
        func: 'over',
        type: 'seriesSet',
        args: {'query': 'string', 'duration': 'string', 'period': 'string', 'num': 'scalar'}
      },
      {
        func: 'shiftBand',
        type: 'seriesSet',
        args: {'query': 'string', 'duration': 'string', 'period': 'string', 'num': 'scalar'}
      },
      {
        func: 'change',
        type: 'numberSet',
        args: {'query': 'string', 'startDuration': 'string', 'endDuration': 'string'}
      },
      {func: 'count', type: 'scalar', args: {'query': 'string', 'startDuration': 'string', 'endDuration': 'string'}},
      {
        func: 'window',
        type: 'seriesSet',
        args: {'query': 'string', 'duration': 'string', 'period': 'string', 'num': 'scalar', 'funcName': 'string'}
      },
    ];
    this.scope.suggestions = [];
    if (!this.target.varCounter) {
      this.target.varCounter = 0;
    }
    if (!this.target.finalQuery) {
      if (this.target.expr) {
        this.target.finalQuery = this.target.expr;
        this.target.expr = ""
      } else {
        this.target.finalQuery = "";
      }
    }
    this.target.subbedQuery = "";
    if (!this.target.flags) {
      this.target.flags = "";
    }
    var _this = this;
    $(document).ready(function () {
      //DOM needs to load before element can be set as sortable
      setTimeout(function () {
        _this.setSortable();
      }, 1000);
    });
    try {
      this.updateFinalQuery(this.target.finalQuery);
    } catch (e) {
      console.log(e)
    }
  }

  objectWithoutProperties(obj, keys) {
    var target = {};
    for (var i in obj) {
      if (keys.indexOf(i) >= 0) continue;
      if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
      target[i] = obj[i];
    }
    return target;
  }

  htmlCollectionToListOfIds(htmlCollection) {
    var ret = [];
    for (var i = 0; i < htmlCollection.length; i++) {
      ret.push(htmlCollection[i].id)
    }
    return ret;
  }

  getVariablesFromUI() {
    return this.htmlCollectionToListOfIds(
      document.getElementById('allVariables').getElementsByTagName("li")
    );
  }

  ensureOrdering(variables) {
    this.setSortable();
    var orderedListOfIds = this.getVariablesFromUI();
    for (var i = 0; i < variables.length; i++) {
      variables[i].indexInUI = orderedListOfIds.indexOf(variables[i].id.toString())
    }
    return _.orderBy(variables, ['indexInUI'])
  }

  setSortable() {
    var el = document.getElementById('allVariables');
    let _this = this;
    Sortable.create(el, {
      onUpdate() {
        _this.target.variables = _this.ensureOrdering(_this.target.variables)
      }
    });
  }

  getMetricSuggestions(typeahead) {
    if (!this.datasource.openTSDBUrl) {
      throw ReferenceError("Missing OpenTSDB URL")
    }
    var request = new Request(this.datasource.openTSDBUrl + "/suggest?type=metrics&q=" + typeahead);

    var the_scope = this.scope;
    var req = fetch(request).then(function (response) {
      return response.json();
    }).then(function (responseSuggestions) {
      the_scope.suggestions = responseSuggestions;
    }).catch(function (error) {
      throw error;
    });
    return req
  }

  deleteVariable(id) {
    //Angular keeps track of objects in ng-repeat, removing $$hashkey prevents issues with ordering after deleting.
    var tmp = [];
    for (var i = 0; i < this.target.variables.length; i++) {
      if (this.target.variables[i].id.toString() !== id.toString()) {
        tmp.push(this.objectWithoutProperties(this.target.variables[i], ["$$hashKey"]))
      }
    }
    this.target.variables = tmp;
  }

  deleteTag(variableId, tagId, type) {
    delete this.target.variables[variableId][type + "tagBoxes"][tagId]
  }

  addNewVariable(type) {
    var variables = this.target.variables;
    const defaultVariable = {id: this.target.varCounter, type: type, startDuration:"$start", duration:"$start", downsampleTime:"$ds"};
    variables.push(defaultVariable);
    this.target.varCounter += 1;
    var _this = this;

    //timeout necessary as ng-repeat doesn't seem to provide a callback when updated
    setTimeout(function () {
      variables = _this.ensureOrdering(variables);
    }, 100);
  }

  addTagBox(queryId, type) {
    const defaultTagBox = {key: "", value: "", editorClosed: false};
    var queryVariable = this.target.variables[queryId];
    if (!queryVariable[type + "tagBoxes"]) {
      queryVariable[type + "tagBoxes"] = {}
    }
    if (!queryVariable[type + "TagBoxCounter"]) {
      queryVariable[type + "TagBoxCounter"] = 0;
    }
    queryVariable[type + "tagBoxes"][queryVariable[type + "TagBoxCounter"]] = defaultTagBox;
    queryVariable[type + "TagBoxCounter"] += 1;
  }

  updateFinalQuery(finalQuery) {
    this.target.expr = substituteFinalQuery(finalQuery, this);
    this.panelCtrl.refresh();
    this.target.finalQuery = finalQuery;
    return substituteFinalQuery(finalQuery, this);
  }

  copyToClipboard(textToCopy) {
    //Creates an input, writes text to it, copies to clipboard, deletes input
    //https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
    if (window.clipboardData && window.clipboardData.setData) {
        // Internet Explorer-specific code path to prevent textarea being shown while dialog is visible.
        return clipboardData.setData("Text", textToCopy);

      }
      else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
        var textarea = document.createElement("textarea");
        textarea.textContent = textToCopy;
        textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in Microsoft Edge.
        document.body.appendChild(textarea);
        textarea.select();
        try {
          return document.execCommand("copy");  // Security exception may be thrown by some browsers.
        }
        catch (ex) {
          console.warn("Copy to clipboard failed.", ex);
          return false;
        }
        finally {
          document.body.removeChild(textarea);
        }
      }
    }

  suggestMetrics(metric, callback) {
    return this.datasource._metricsStartWith(metric).then(callback);
  }

  metricInfo() {
    return this.datasource._tagKeysForMetric(this.queryHelper.metric).then((tagKeys) => {
      this.datasource.q.all(_.map(tagKeys, (tagKey) => {
          return this.datasource._tagValuesForMetricAndTagKey(this.queryHelper.metric, tagKey).then((tagValues) => {
            return {key: tagKey, value: tagValues}
          })
        })
      ).then((tagKeysToValues) => {
        tagKeysToValues = _.each(tagKeysToValues, (v) => {
          v.filterType = "Group By"
        });
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

export default {BosunDatasourceQueryCtrl}
BosunDatasourceQueryCtrl.templateUrl = 'datasource/partials/query.editor.html';
