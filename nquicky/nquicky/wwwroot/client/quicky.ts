/// <reference path="angular.d.ts"/>
namespace quicky {
    export function cast<T>(obj): T {
        return obj;
    }
    export class viewInfo {
        originContent: string;
        content: string;
        scripts: scriptInfo[];

    }
    export class scriptInfo {
        
        src: string;
        content: string;

    }
    export namespace services {
        
        
        export type IHtmlLoader = (url: string, handler: (err: any, res: viewInfo) => void) => void;
        export interface IViewCompiler {
            (
                scope: IScope,
                url: string,
                onComplete: (err, scope?: IScope) => void
            )
        }
        export interface IScriptLoader {
            (
                scope: IScope,
                view: viewInfo,
                onComplete: (err, contents?: string[]) => void
            )
        }
    }
    export interface IScope extends angular.IScope {
        $$urlInfo: urlInfo;

    }
    export var mdl: angular.IModule = null;
    mdl = angular.module("quicky", []);
}
namespace quicky {
    export function absUrl(): string {
        return window.location.protocol + "//" + window.location.host;
    }
    
    
    export class urlInfoData {
        ref: string;
        value: string;
        
    }
    export class urlInfo {
        absUrl: urlInfoData;
        relUrl: urlInfoData;
        hostUrl: string;
        constructor(scope: IScope, url: string) {
            this.absUrl = new urlInfoData();
            this.relUrl = new urlInfoData();
            var tmpUrl = url;
            var hostUrl = absUrl();
            this.hostUrl = hostUrl;
            if (tmpUrl.length > hostUrl.length) {
                if (tmpUrl.substring(0, hostUrl.length).toLowerCase() == hostUrl.toLowerCase()) {
                    tmpUrl = tmpUrl.substring(hostUrl.length, tmpUrl.length);
                }
            }
            while (tmpUrl.substring(0, 1) === '/') {
                tmpUrl = tmpUrl.substring(1, tmpUrl.length);
            }
            while (tmpUrl.substring(0, tmpUrl.length-1) === '/') {
                tmpUrl = tmpUrl.substring(0, tmpUrl.length-1);
            }
            
            if (scope.$parent === scope.$root) {
                this.relUrl.ref = "/";
                this.relUrl.value = tmpUrl;
                this.absUrl.ref = this.hostUrl;
                this.absUrl.value = this.hostUrl;
            }
            else {
                var items = tmpUrl.split('/');
                this.relUrl.ref = "";
                this.relUrl.value = "";
                items.forEach((value, index, lst) => {
                    if (index < lst.length-1) {
                        this.relUrl.ref += "/"+value 
                        
                    }
                    this.relUrl.value += "/" + value;
                });
                if (this.relUrl.ref === "") {
                    this.relUrl.ref = "/";
                };
                this.absUrl.ref = this.hostUrl + this.relUrl.ref;
                this.absUrl.value = this.hostUrl + this.relUrl.value;
            }
        }
    }
    class view {
        loadContent(content: string): viewInfo {
            var ret = new viewInfo();
            ret.originContent = content;
            ret.content = this.getBody(content);
            ret.scripts = this.extractScripts(content);
            return ret;
        }
        getBody(content: string): string {
            var indexOfBody = content.indexOf("<body");
            if (indexOfBody == -1) {
                indexOfBody = 0;
            }
            else {
                indexOfBody = content.indexOf(">", indexOfBody + "<body".length);
                indexOfBody++;
            }
            var indexOfEndBody = content.lastIndexOf("</body>");
            if (indexOfEndBody == -1) {
                indexOfEndBody = content.length;
            }
            return content.substring(indexOfBody, indexOfEndBody);
        }
        extractScripts(content: string): scriptInfo[] {
            var ret: scriptInfo[] = [];
            var indexOfScript = content.indexOf("<script");
            while (indexOfScript > -1) {
                var startIndex = indexOfScript;
                indexOfScript = content.indexOf(">", indexOfScript + 1);
                var indexOfEndScript = content.indexOf("</script>", indexOfScript);

                var strHeadeScript = content.substring(startIndex, indexOfScript);
                var scriptSource = "";
                var isFromSource = false;
                if (strHeadeScript.indexOf('src="') > -1) {
                    isFromSource = true;
                    scriptSource = strHeadeScript.split('src="')[1].split('"')[0];
                }
                else if (strHeadeScript.indexOf("src='") > -1) {
                    isFromSource = true;
                    scriptSource = strHeadeScript.split("src='")[1].split("'")[0];
                }
                else {
                    indexOfScript += 1;

                    scriptSource = content.substring(indexOfScript, indexOfEndScript);

                }
                content = content.substring(indexOfEndScript + "</script>".length, content.length);
                indexOfScript = content.indexOf("<script");
                var item = new scriptInfo();
                if (isFromSource) {

                    item.src = scriptSource;
                }
                else {
                    item.content = scriptSource;
                }
                ret.push(item);
            }
            return ret;
        }
    }
    mdl.service("$htmlLoader", ["$http", ($http: angular.IHttpService) => {
        var loader: quicky.services.IHtmlLoader = (url, handler) => {
            $http.get(url).then(res => {
                var ret = new view();
                var retView = ret.loadContent(res.data as string);
                handler(undefined, retView);
            }, err => {
                handler(err, undefined);
            }).catch(err => {
                handler(err, undefined);
            });
        };

        return loader;
    }]);

}
namespace quicky {
    mdl.service(
        "$scriptLoader",
        [
            "$http",
            (
                $http: angular.IHttpService
            ) => {
                var retService: services.IScriptLoader;
                retService= (
                    scope,
                    view,
                    onComplete
                ) => {
                    var scriptContents: string[] = [];
                    var run = (index: number, handler: (err) => void) => {
                        if (index === view.scripts.length) {
                            handler(undefined);
                        }
                        else {
                            var scriptItem = view.scripts[index];
                            if (scriptItem.content) {
                                scriptContents.push(scriptItem.content);
                                run(index + 1, handler);
                            }
                            else if (scriptItem.src) {
                                var scriptSource = scriptItem.src;
                                
                                if ((scriptItem.src.length > 2) && (scriptItem.src.substring(0, 2) === "./")) {
                                    scriptSource = scriptItem.src.substr(2, scriptItem.src.length);
                                    scriptSource = absUrl() + "/" + scriptSource;
                                }
                                else {
                                    scriptSource = scope.$$urlInfo.absUrl.ref + scriptSource;
                                    
                                }

                                $http.get(scriptSource).then(res => {
                                    scriptContents.push(res.data as string);
                                    run(index + 1, handler);
                                }, err => {
                                        handler(err);
                                }).catch(ex => {
                                    handler(ex);
                                });
                            }
                        }
                    };
                    
                    run(0, err => {
                        if (err) {
                            onComplete(err);
                        }
                        else {
                            onComplete(undefined, scriptContents);
                        }
                    });
                }
                return retService;
            }
        ]
    );
}
namespace quicky {
    export class scriptRunner {
        invoke(fn: any, $injector, extraParams?) {
            
            if (angular.isFunction(fn)) {
                fn(this.scope);
            }
            else if (angular.isArray(fn)) {
                var args: Array<any> = fn;
                var invokeParams = [];
                args.forEach((arg, index, lst) => {
                    if (index < args.length - 1) {
                        var injectotInstance = $injector.get(arg);
                        invokeParams.push(injectotInstance);
                    }
                    else {
                        invokeParams.push(this.scope);
                    }
                });
                if (extraParams) {
                    invokeParams.push(extraParams);
                }
                var excuteFn: Function = args[args.length - 1];
                excuteFn.apply(null, invokeParams);
                
            }
        }
        loadAllScript(): any[] {
            var ret = [];
            this.scriptContents.forEach((scriptContent, index, lst) => {
                var fn = Function(this.getScript(index))();
                ret.push(fn);
            })
            return ret;
        }
        getScript(index: number): string {
            if (index >= this.scriptContents.length) {
                return undefined;
            }
            var ret = "ret=" + this.scriptContents[index]
            ret = ret + String.fromCharCode(10) + String.fromCharCode(13) + ";return ret";
            return ret;
        }
        scope: IScope;
        scriptContents: string[];
        constructor(scope: IScope, scriptContents: string[]) {
            this.scope = scope;
            this.scriptContents = scriptContents;
        }
    }
}
namespace quicky {
    
    mdl.service("$viewCompiler", [
        "$htmlLoader",
        "$compile",
        "$scriptLoader",
        "$injector",
        (
            $htmLoader: services.IHtmlLoader,
            $compile: angular.ICompileService,
            $scriptLoader: services.IScriptLoader,
            $injector:any
        ) => {
            var retService: services.IViewCompiler;
            retService = (scope, url,onCompleted ) => {
                var subScope = cast<IScope>(scope.$new(true, scope));

                var loadUrl = url;
                if ((loadUrl.length > 2) && (loadUrl.substring(0, 2) === "./")) {
                    loadUrl = loadUrl.substring(2, loadUrl.length);
                    loadUrl = absUrl() + "/" + loadUrl;
                }
                else {
                    loadUrl = scope.$$urlInfo.absUrl.ref + loadUrl;
                }
                subScope.$$urlInfo = new urlInfo(subScope, loadUrl)
                $htmLoader(loadUrl, (err, res) => {
                    if (err) {
                        throw (err);
                    }
                    else {
                        $scriptLoader(subScope, res, (err, contents) => {
                            
                            if (err) {
                                onCompleted(err)
                            }
                            else {
                                var srcRunner = new scriptRunner(subScope, contents)
                                var scripts: Array<any> = srcRunner.loadAllScript();
                                scripts.forEach((fn, index, lst) => {
                                    srcRunner.invoke(fn, $injector);
                                });
                                onCompleted(undefined, scope);
                            }
                        });
                    }
                });
            };
            return retService;
    }]);
}
namespace quicky {
    export function controller(
        module: angular.IModule,
        controllerName: string,
        args: Array<any>,
        handlerOnInit?: (err: any, scope: IScope) => void
    ) {
        var injections = [];
        function init(..._args: any) {
            var scope: IScope = _args[args.length - 1];
            try {
                scope.$$urlInfo = new urlInfo(scope, window.location.href);
                args[args.length - 1].apply(null, _args);

                if (handlerOnInit) {
                    handlerOnInit(undefined, scope);
                }
            }
            catch (ex) {
                throw (ex);
               
            }

        }
        args.forEach((val, index, lst) => {
            if (index === lst.length - 1) {
                injections.push("$scope");
                injections.push(init);
            }
            else {
                injections.push(val)
            }
        })
        var scope = injections[injections.length - 1];

        var retController = module.controller(controllerName, injections);

    }
}