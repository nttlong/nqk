/// <reference path="angular.d.ts"/>
namespace quicky {

    export interface IScope extends angular.IScope {

    }
    export var mdl: angular.IModule = null;
    mdl = angular.module("quicky", []);
}
namespace quicky {
    export type IHtmlLoader = (url: string, handler: (err: any, res: viewInfo) => void) => void;
    class viewInfo {
        originContent: string;
        content: string;
        scripts: scriptInfo[];

    }
    class scriptInfo {
        src: string;
        content: string;

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
        }
        extractScripts(content: string): scriptInfo[] {
            debugger;
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
        var loader: IHtmlLoader = (url, handler) => {
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