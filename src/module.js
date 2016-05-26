import {BosunDatasource} from './datasource';
import {BosunDatasourceQueryCtrl} from './query_ctrl';

class BosunConfigCtrl { }
BosunConfigCtrl.templateUrl = 'partials/config.html';

class BosunQueryOptionsCtrl { }
BosunQueryOptionsCtrl.templateUrl = 'partials/query.options.html';

class BosunAnnotationsQueryCtrl {
  constructor() {
    this.showHelp = 0;
  }
}
BosunAnnotationsQueryCtrl.templateUrl = 'partials/annotations.editor.html'

export {
BosunDatasource as Datasource,
BosunDatasourceQueryCtrl as QueryCtrl,
BosunConfigCtrl as ConfigCtrl,
BosunQueryOptionsCtrl as QueryOptionsCtrl,
BosunAnnotationsQueryCtrl as AnnotationsQueryCtrl
};
