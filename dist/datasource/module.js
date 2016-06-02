'use strict';

System.register(['./datasource', './query_ctrl'], function (_export, _context) {
  var BosunDatasource, BosunDatasourceQueryCtrl, BosunConfigCtrl, BosunQueryOptionsCtrl, BosunAnnotationsQueryCtrl;

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

      BosunConfigCtrl.templateUrl = 'datasource/partials/config.html';

      _export('QueryOptionsCtrl', BosunQueryOptionsCtrl = function BosunQueryOptionsCtrl() {
        _classCallCheck(this, BosunQueryOptionsCtrl);
      });

      BosunQueryOptionsCtrl.templateUrl = 'datasource/partials/query.options.html';

      _export('AnnotationsQueryCtrl', BosunAnnotationsQueryCtrl = function BosunAnnotationsQueryCtrl() {
        _classCallCheck(this, BosunAnnotationsQueryCtrl);

        this.showHelp = 0;
      });

      BosunAnnotationsQueryCtrl.templateUrl = 'datasource/partials/annotations.editor.html';

      _export('Datasource', BosunDatasource);

      _export('QueryCtrl', BosunDatasourceQueryCtrl);

      _export('ConfigCtrl', BosunConfigCtrl);

      _export('QueryOptionsCtrl', BosunQueryOptionsCtrl);

      _export('AnnotationsQueryCtrl', BosunAnnotationsQueryCtrl);
    }
  };
});
//# sourceMappingURL=module.js.map
