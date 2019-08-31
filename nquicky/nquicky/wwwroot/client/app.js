var apps;
(function (apps) {
    function start(moduleName, controllerName, injections) {
        injections.push("quicky");
        var mdl = angular.module(moduleName, injections);
        var ctr = mdl.controller(controllerName, [
            "$htmlLoader", "$scope", function (htmlLoader, scope) {
                debugger;
                console.log(htmlLoader);
                htmlLoader("./test2.html", function (e, r) {
                    alert("OK");
                    console.log(r);
                });
            }
        ]);
    }
    apps.start = start;
})(apps || (apps = {}));
//# sourceMappingURL=app.js.map