namespace Config {
  export class App {
    static $inject = ['$provide'];
    constructor(protected $provide: ng.auto.IProvideService) {
      //$provide.constant("productId", $("#productId").attr("href"));
    }
  }
  export class Http {
    static $inject = ['$http'];
    constructor($http: ng.IHttpService) {}
  }
}

angular
  .module('base-config', [])
  .config(Config.App)
  .run(Config.Http);

angular
  .module('village', ['base-config'])
  .controller('homeCtrl', Controllers.HomeController)
  .directive('ngDatatable', Directives.ngDatatableDirectiveFactory);
