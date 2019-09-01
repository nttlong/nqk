namespace apps {
    
    export function start(
        moduleName: string,
        controllerName: string,
        injections: string[]
    ) {
        injections.push("quicky");
        var mdl = angular.module(moduleName, injections);
        var ctr = quicky.controller(  mdl,controllerName, [
            "$viewCompiler", (
                viewCompiler: quicky.services.IViewCompiler,
                scope: quicky.IScope) => {
                console.log(scope.$$urlInfo);
                console.log(viewCompiler);
                viewCompiler(scope, "./test2.html", (e, r) => {
                    console.log(e);
                    console.log(r);
                })
            }]);
    }
}