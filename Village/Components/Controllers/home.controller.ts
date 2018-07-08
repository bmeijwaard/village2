module Controllers {
    export class HomeController {
        static $inject = ["$scope"];
        constructor(public $scope: Scopes.IHomeScope) {
        }
    }
}