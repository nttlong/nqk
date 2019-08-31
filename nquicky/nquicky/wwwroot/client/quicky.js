/// <reference path="angular.d.ts"/>
var quicky;
(function (quicky) {
    quicky.mdl = null;
    quicky.mdl = angular.module("quicky", []);
})(quicky || (quicky = {}));
(function (quicky) {
    var viewInfo = /** @class */ (function () {
        function viewInfo() {
        }
        return viewInfo;
    }());
    var scriptInfo = /** @class */ (function () {
        function scriptInfo() {
        }
        return scriptInfo;
    }());
    var view = /** @class */ (function () {
        function view() {
        }
        view.prototype.loadContent = function (content) {
            var ret = new viewInfo();
            ret.originContent = content;
            ret.content = this.getBody(content);
            ret.scripts = this.extractScripts(content);
            return ret;
        };
        view.prototype.getBody = function (content) {
            debugger;
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
            debugger;
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
//# sourceMappingURL=quicky.js.map