namespace apps {
    
    export function start(
        moduleName: string,
        controllerName: string,
        injections: string[]
    ) {
        injections.push("quicky");
        var mdl = angular.module(moduleName, injections);
        var ctr = mdl.controller(controllerName, [
            "$htmlLoader","$scope", (
            htmlLoader: quicky.IHtmlLoader,
                scope: quicky.IScope) => {
                debugger;
                console.log(htmlLoader);
                htmlLoader("./test2.html", (e, r) => {
                    alert("OK");
                    console.log(r);
                })
        }]);
    }
}