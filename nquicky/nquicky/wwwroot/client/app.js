var apps;
(function (apps) {
    function start(moduleName, controllerName, injections) {
        injections.push("quicky");
        var mdl = angular.module(moduleName, injections);
        var ctr = quicky.controller(mdl, controllerName, [
            "$viewCompiler", function (viewCompiler, scope) {
                console.log(scope.$$urlInfo);
                console.log(viewCompiler);
                viewCompiler(scope, "./test2.html", function (e, r) {
                    console.log(e);
                    console.log(r);
                });
            }
        ]);
    }
    apps.start = start;
})(apps || (apps = {}));
//# sourceMappingURL=app.js.map