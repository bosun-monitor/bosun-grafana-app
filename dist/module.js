'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.QueryOptionsCtrl = exports.ConfigCtrl = exports.QueryCtrl = exports.Datasource = undefined;

var _datasource = require('./datasource');

var _query_ctrl = require('./query_ctrl');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BosunConfigCtrl = function BosunConfigCtrl() {
  _classCallCheck(this, BosunConfigCtrl);
};

BosunConfigCtrl.templateUrl = 'partials/config.html';

var BosunQueryOptionsCtrl = function BosunQueryOptionsCtrl() {
  _classCallCheck(this, BosunQueryOptionsCtrl);
};

BosunQueryOptionsCtrl.templateUrl = 'partials/query.options.html';

//class BosunAnnotationsQueryCtrl {}
//BosunAnnotationsQueryCtrl.templateUrl = 'partials/annotations.editor.html'

exports.Datasource = _datasource.BosunDatasource;
exports.QueryCtrl = _query_ctrl.BosunDatasourceQueryCtrl;
exports.ConfigCtrl = BosunConfigCtrl;
exports.QueryOptionsCtrl = BosunQueryOptionsCtrl;
//# sourceMappingURL=module.js.map
