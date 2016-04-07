'use strict';

System.register(['./datasource', './query_ctrl'], function (_export, _context) {
  var BosunDatasource, BosunDatasourceQueryCtrl, BosunConfigCtrl, BosunQueryOptionsCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_datasource) {
      BosunDatasource = _datasource.BosunDatasource;
    }, function (_query_ctrl) {
      BosunDatasourceQueryCtrl = _query_ctrl.BosunDatasourceQueryCtrl;
    }],
    execute: function () {
      _export('ConfigCtrl', BosunConfigCtrl = function BosunConfigCtrl() {
        _classCallCheck(this, BosunConfigCtrl);
      });

      BosunConfigCtrl.templateUrl = 'partials/config.html';

      _export('QueryOptionsCtrl', BosunQueryOptionsCtrl = function BosunQueryOptionsCtrl() {
        _classCallCheck(this, BosunQueryOptionsCtrl);
      });

      BosunQueryOptionsCtrl.templateUrl = 'partials/query.options.html';

      //class BosunAnnotationsQueryCtrl {}
      //BosunAnnotationsQueryCtrl.templateUrl = 'partials/annotations.editor.html'

      _export('Datasource', BosunDatasource);

      _export('QueryCtrl', BosunDatasourceQueryCtrl);

      _export('ConfigCtrl', BosunConfigCtrl);

      _export('QueryOptionsCtrl', BosunQueryOptionsCtrl);
    }
  };
});
//# sourceMappingURL=module.js.map
