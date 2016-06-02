import {BosunDatasource} from './datasource';
import {BosunDatasourceQueryCtrl} from './query_ctrl';

class BosunConfigCtrl { }
BosunConfigCtrl.templateUrl = 'datasource/partials/config.html';

class BosunQueryOptionsCtrl { }
BosunQueryOptionsCtrl.templateUrl = 'datasource/partials/query.options.html';

class BosunAnnotationsQueryCtrl {
  constructor() {
    this.showHelp = 0;
  }
}
BosunAnnotationsQueryCtrl.templateUrl = 'datasource/partials/annotations.editor.html'

export {
BosunDatasource as Datasource,
BosunDatasourceQueryCtrl as QueryCtrl,
BosunConfigCtrl as ConfigCtrl,
BosunQueryOptionsCtrl as QueryOptionsCtrl,
BosunAnnotationsQueryCtrl as AnnotationsQueryCtrl
};
