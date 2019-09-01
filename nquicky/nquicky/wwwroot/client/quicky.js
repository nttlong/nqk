/// <reference path="angular.d.ts"/>
var quicky;
(function (quicky) {
    function cast(obj) {
        return obj;
    }
    quicky.cast = cast;
    var viewInfo = /** @class */ (function () {
        function viewInfo() {
        }
        return viewInfo;
    }());
    quicky.viewInfo = viewInfo;
    var scriptInfo = /** @class */ (function () {
        function scriptInfo() {
        }
        return scriptInfo;
    }());
    quicky.scriptInfo = scriptInfo;
    quicky.mdl = null;
    quicky.mdl = angular.module("quicky", []);
})(quicky || (quicky = {}));
(function (quicky) {
    function absUrl() {
        return window.location.protocol + "//" + window.location.host;
    }
    quicky.absUrl = absUrl;
    var urlInfoData = /** @class */ (function () {
        function urlInfoData() {
        }
        return urlInfoData;
    }());
    quicky.urlInfoData = urlInfoData;
    var urlInfo = /** @class */ (function () {
        function urlInfo(scope, url) {
            var _this = this;
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
            while (tmpUrl.substring(0, tmpUrl.length - 1) === '/') {
                tmpUrl = tmpUrl.substring(0, tmpUrl.length - 1);
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
                items.forEach(function (value, index, lst) {
                    if (index < lst.length - 1) {
                        _this.relUrl.ref += "/" + value;
                    }
                    _this.relUrl.value += "/" + value;
                });
                if (this.relUrl.ref === "") {
                    this.relUrl.ref = "/";
                }
                ;
                this.absUrl.ref = this.hostUrl + this.relUrl.ref;
                this.absUrl.value = this.hostUrl + this.relUrl.value;
            }
        }
        return urlInfo;
    }());
    quicky.urlInfo = urlInfo;
    var view = /** @class */ (function () {
        function view() {
        }
        view.prototype.loadContent = function (content) {
            var ret = new quicky.viewInfo();
            ret.originContent = content;
            ret.content = this.getBody(content);
            ret.scripts = this.extractScripts(content);
            return ret;
        };
        view.prototype.getBody = function (content) {
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
        };
        view.prototype.extractScripts = function (content) {
            var ret = [];
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
                var item = new quicky.scriptInfo();
                if (isFromSource) {
                    item.src = scriptSource;
                }
                else {
                    item.content = scriptSource;
                }
                ret.push(item);
            }
            return ret;
        };
        return view;
    }());
    quicky.mdl.service("$htmlLoader", ["$http", function ($http) {
            var loader = function (url, handler) {
                $http.get(url).then(function (res) {
                    var ret = new view();
                    var retView = ret.loadContent(res.data);
                    handler(undefined, retView);
                }, function (err) {
                    handler(err, undefined);
                }).catch(function (err) {
                    handler(err, undefined);
                });
            };
            return loader;
        }]);
})(quicky || (quicky = {}));
(function (quicky) {
    quicky.mdl.service("$scriptLoader", [
        "$http",
        function ($http) {
            var retService;
            retService = function (scope, view, onComplete) {
                var scriptContents = [];
                var run = function (index, handler) {
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
                                scriptSource = quicky.absUrl() + "/" + scriptSource;
                            }
                            else {
                                scriptSource = scope.$$urlInfo.absUrl.ref + scriptSource;
                            }
                            $http.get(scriptSource).then(function (res) {
                                scriptContents.push(res.data);
                                run(index + 1, handler);
                            }, function (err) {
                                handler(err);
                            }).catch(function (ex) {
                                handler(ex);
                            });
                        }
                    }
                };
                run(0, function (err) {
                    if (err) {
                        onComplete(err);
                    }
                    else {
                        onComplete(undefined, scriptContents);
                    }
                });
            };
            return retService;
        }
    ]);
})(quicky || (quicky = {}));
(function (quicky) {
    var scriptRunner = /** @class */ (function () {
        function scriptRunner(scope, scriptContents) {
            this.scope = scope;
            this.scriptContents = scriptContents;
        }
        scriptRunner.prototype.invoke = function (fn, $injector, extraParams) {
            var _this = this;
            if (angular.isFunction(fn)) {
                fn(this.scope);
            }
            else if (angular.isArray(fn)) {
                var args = fn;
                var invokeParams = [];
                args.forEach(function (arg, index, lst) {
                    if (index < args.length - 1) {
                        var injectotInstance = $injector.get(arg);
                        invokeParams.push(injectotInstance);
                    }
                    else {
                        invokeParams.push(_this.scope);
                    }
                });
                if (extraParams) {
                    invokeParams.push(extraParams);
                }
                var excuteFn = args[args.length - 1];
                excuteFn.apply(null, invokeParams);
            }
        };
        scriptRunner.prototype.loadAllScript = function () {
            var _this = this;
            var ret = [];
            this.scriptContents.forEach(function (scriptContent, index, lst) {
                var fn = Function(_this.getScript(index))();
                ret.push(fn);
            });
            return ret;
        };
        scriptRunner.prototype.getScript = function (index) {
            if (index >= this.scriptContents.length) {
                return undefined;
            }
            var ret = "ret=" + this.scriptContents[index];
            ret = ret + String.fromCharCode(10) + String.fromCharCode(13) + ";return ret";
            return ret;
        };
        return scriptRunner;
    }());
    quicky.scriptRunner = scriptRunner;
})(quicky || (quicky = {}));
(function (quicky) {
    quicky.mdl.service("$viewCompiler", [
        "$htmlLoader",
        "$compile",
        "$scriptLoader",
        "$injector",
        function ($htmLoader, $compile, $scriptLoader, $injector) {
            var retService;
            retService = function (scope, url, onCompleted) {
                var subScope = quicky.cast(scope.$new(true, scope));
                var loadUrl = url;
                if ((loadUrl.length > 2) && (loadUrl.substring(0, 2) === "./")) {
                    loadUrl = loadUrl.substring(2, loadUrl.length);
                    loadUrl = quicky.absUrl() + "/" + loadUrl;
                }
                else {
                    loadUrl = scope.$$urlInfo.absUrl.ref + loadUrl;
                }
                subScope.$$urlInfo = new quicky.urlInfo(subScope, loadUrl);
                $htmLoader(loadUrl, function (err, res) {
                    if (err) {
                        throw (err);
                    }
                    else {
                        $scriptLoader(subScope, res, function (err, contents) {
                            if (err) {
                                onCompleted(err);
                            }
                            else {
                                var srcRunner = new quicky.scriptRunner(subScope, contents);
                                var scripts = srcRunner.loadAllScript();
                                scripts.forEach(function (fn, index, lst) {
                                    srcRunner.invoke(fn, $injector);
                                });
                                onCompleted(undefined, scope);
                            }
                        });
                    }
                });
            };
            return retService;
        }
    ]);
})(quicky || (quicky = {}));
(function (quicky) {
    function controller(module, controllerName, args, handlerOnInit) {
        var injections = [];
        function init() {
            var _args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _args[_i] = arguments[_i];
            }
            var scope = _args[args.length - 1];
            try {
                scope.$$urlInfo = new quicky.urlInfo(scope, window.location.href);
                args[args.length - 1].apply(null, _args);
                if (handlerOnInit) {
                    handlerOnInit(undefined, scope);
                }
            }
            catch (ex) {
                throw (ex);
            }
        }
        args.forEach(function (val, index, lst) {
            if (index === lst.length - 1) {
                injections.push("$scope");
                injections.push(init);
            }
            else {
                injections.push(val);
            }
        });
        var scope = injections[injections.length - 1];
        var retController = module.controller(controllerName, injections);
    }
    quicky.controller = controller;
})(quicky || (quicky = {}));
//# sourceMappingURL=quicky.js.map