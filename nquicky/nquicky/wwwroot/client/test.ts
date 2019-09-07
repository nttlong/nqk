namespace client {
    export interface ITestScope extends quicky.IScope {
        /**
         * load data from server
         * */
        doLoadData: () => void
    }
}
[
    "$http", (
        $http: angular.IHttpService,
        scope: client.ITestScope
    ) => {
        scope.doLoadData = () => {

        }
        alert(scope.doLoadData);
    }
]