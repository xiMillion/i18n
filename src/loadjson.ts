declare var window: any;
declare var document: any;
declare var navigator: any;

export default function (url:string) : any{

    return new Promise((resolve,reject)=>{

        if(!/.json$/.test(url)){

            window.module = window.module || {};
        
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = url;
            document.head.appendChild(script);
            script.onload = (a:any) => {
                var _export:object = window.module.exports;
                if(_export){
                    resolve(_export);
                };
                script.onload = script.onerror = null;
                script.remove();
                delete window.module;
            };
            script.onerror = ()=>{
                script.onload = script.onerror = null;
                script.remove();
                delete window.module;
                reject({
                    status: 404,
                    statusText: `get ${url} error`
                });
            };
        }else{
            var rawFile : any = new XMLHttpRequest();
            rawFile.overrideMimeType("application/json");
            rawFile.open("GET", url, true);
            rawFile.onreadystatechange = function() {
                if (rawFile.readyState === 4 && rawFile.status == "200") {
                    resolve(JSON.parse(rawFile.responseText));
                }else if(rawFile.readyState === 4 && rawFile.status >= 400){
                    reject({
                        status: rawFile.status,
                        statusText: rawFile.statusText
                    })
                }
            };
            rawFile.send();
        }
    })
}