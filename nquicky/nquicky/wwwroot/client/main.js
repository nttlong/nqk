/// <reference path="jquery.d.ts" />
requirejs([
    "https://ajax.googleapis.com/ajax/libs/angularjs/1.7.8/angular.min.js",
    "https://code.jquery.com/jquery-3.4.1.min.js",
], function () {
    function loadCss(url) {
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = url;
        document.getElementsByTagName("head")[0].appendChild(link);
    }
    loadCss("client/app.css");
    requirejs(["../client/quicky.js"], function () {
        debugger;
        $("body").attr("ng-app", "test");
        $("body").attr("ng-controller", "test");
        var mdl = angular.module("test", ["quicky"]);
        mdl.controller("test", ["$scope", function (scope) {
                scope.url = "test.123";
                scope.$applyAsync();
            }]);
        angular.bootstrap($("body")[0], ["test"]);
    });
});
//# sourceMappingURL=main.js.map