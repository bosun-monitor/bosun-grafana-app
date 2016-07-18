'use strict';

System.register(['app/plugins/sdk', './css/query-editor.css!'], function (_export, _context) {
  "use strict";

  var QueryCtrl, _createClass, BosunDatasourceQueryCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  return {
    setters: [function (_appPluginsSdk) {
      QueryCtrl = _appPluginsSdk.QueryCtrl;
    }, function (_cssQueryEditorCss) {}],
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

      _export('BosunDatasourceQueryCtrl', BosunDatasourceQueryCtrl = function (_QueryCtrl) {
        _inherits(BosunDatasourceQueryCtrl, _QueryCtrl);

        function BosunDatasourceQueryCtrl($scope, $injector, uiSegmentSrv) {
          _classCallCheck(this, BosunDatasourceQueryCtrl);

          var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(BosunDatasourceQueryCtrl).call(this, $scope, $injector));

          _this.scope = $scope;
          _this.queryHelper = {};
          _this.uiSegmentSrv = uiSegmentSrv;
          _this.target.expandHelper = 0;
          _this.target.target = _this.target.target || 'Bosun Query';
          _this.suggestMetrics = _this.suggestMetrics.bind(_this);
          _this.addSuggest = _this.addSuggest.bind(_this);
          _this.labelFromUnit = _this.labelFromUnit.bind(_this);
          _this.metricInfo = _this.metricInfo.bind(_this);
          _this.suggestQuery = _this.suggestQuery.bind(_this);
          _this.suggestTagValues = _this.suggestTagValues.bind(_this);
          _this.filterTypes = ["Group By", "Filter"];
          return _this;
        }

        _createClass(BosunDatasourceQueryCtrl, [{
          key: 'suggestMetrics',
          value: function suggestMetrics(metric, callback) {
            return this.datasource._metricsStartWith(metric).then(callback);
          }
        }, {
          key: 'metricInfo',
          value: function metricInfo() {
            var _this2 = this;

            return this.datasource._tagKeysForMetric(this.queryHelper.metric).then(function (tagKeys) {
              _this2.datasource.q.all(_.map(tagKeys, function (tagKey) {
                return _this2.datasource._tagValuesForMetricAndTagKey(_this2.queryHelper.metric, tagKey).then(function (tagValues) {
                  return { key: tagKey, value: tagValues };
                });
              })).then(function (tagKeysToValues) {
                tagKeysToValues = _.each(tagKeysToValues, function (v) {
                  v.filterType = "Group By";
                });
                _this2.queryHelper.tagKeysToValues = tagKeysToValues;
              });
            }).then(function () {
              return _this2.datasource._metricMetadata(_this2.queryHelper.metric).then(function (metadata) {
                _this2.queryHelper.rate = metadata.Rate;
                _this2.queryHelper.unit = metadata.Unit;
                _this2.queryHelper.desc = metadata.Desc;
              });
            }).then(function () {
              return _this2.suggestQuery();
            });
          }
        }, {
          key: 'suggestTagValues',
          value: function suggestTagValues(key, callback) {
            return this.queryHelper.tagKeysToValues[key].then(callback);
          }
        }, {
          key: 'labelFromUnit',
          value: function labelFromUnit() {
            if (this.panelCtrl.panel.type === "graph") {
              this.panelCtrl.panel.yaxes[0].label = this.queryHelper.unit;
            }
            if (this.panelCtrl.panel.type === "singlestat") {
              this.panelCtrl.panel.postfix = " " + this.queryHelper.unit;
            }
          }
        }, {
          key: 'suggestQuery',
          value: function suggestQuery() {
            var _this3 = this;

            var metric = this.queryHelper.metric || "metric.goes.here";
            var selectedGroupByTags = [];
            var selectedFilterTags = [];
            _.each(this.queryHelper.tagKeysToValues, function (v) {
              if (v.selectedValue && v.selectedValue != "") {
                if (v.filterType === _this3.filterTypes[0]) {
                  selectedGroupByTags.push(v.key + "=" + v.selectedValue);
                }
                if (v.filterType === _this3.filterTypes[1]) {
                  selectedFilterTags.push(v.key + "=" + v.selectedValue);
                }
              }
            }, this);
            var rate = "";
            if (this.queryHelper.rate && this.queryHelper.rate == "counter") {
              rate = "rate{counter,,1}:";
            }
            this.queryHelper.suggestedQuery = "q(\"avg:$ds-avg:" + rate + metric + "{" + selectedGroupByTags.join(",") + "}" + "{" + selectedFilterTags.join(",") + "}" + "\", \"$start\", \"\")";
          }
        }, {
          key: 'onChangeInternal',
          value: function onChangeInternal() {
            this.panelCtrl.refresh(); // Asks the panel to refresh data.
          }
        }, {
          key: 'addSuggest',
          value: function addSuggest() {
            if (this.target.expr) {
              this.target.expr += "\n" + this.queryHelper.suggestedQuery;
            } else {
              this.target.expr = this.queryHelper.suggestedQuery;
            }
          }
        }]);

        return BosunDatasourceQueryCtrl;
      }(QueryCtrl));

      _export('BosunDatasourceQueryCtrl', BosunDatasourceQueryCtrl);

      BosunDatasourceQueryCtrl.templateUrl = 'datasource/partials/query.editor.html';
    }
  };
});
//# sourceMappingURL=query_ctrl.js.map
