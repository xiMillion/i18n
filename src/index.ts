declare var window: any;
declare var document: any;
declare var navigator: any;

interface Option {
    locale?: string;
    messages?: LangMap;
    baseURL?: string;
    elTag?: string;
    suffix?: string;
}

interface language {
    [propName: string]: object
};

interface LangMap {
    [propName: string]: language
}

type successFn = (o:language) => void;
type errorFn = (o:{}) => void;

import loadJson from './loadjson';

class i18n {
    locale: string;
    baseURL: string;
    langlib: language;
    elTag: string;
    suffix: string;
    static langMap = <LangMap>{};

    constructor(option = <Option>{}) {
        this.locale = option.locale;
        this.baseURL = option.baseURL;
        this.elTag = option.elTag || 'font';
        this.suffix = option.suffix || 'json';
        Object.assign(i18n.langMap,option.messages || {});

        if (this.locale && i18n.langMap[this.locale]) {
            this.langlib = i18n.langMap[this.locale];
        }
    }

    load(url: string) {
        return loadJson(this.baseURL + url + '.' + this.suffix);
    }

    setLanguage(locale: string,language?: language) {
        this.locale = locale;
        if(language){
            i18n.langMap[locale] = language;
        }
        return new Promise((resolve:successFn,reject:errorFn)=>{
            this.run.bind(this)(()=>{
                this.re();
                resolve(this.langlib);
            },reject)
        })
    }

    then(callback: successFn): this {
        this.run(callback, callback);
        return this;
    }

    run(success?: successFn, error?: errorFn):void {
        if (i18n.langMap[this.locale]) {
            this.langlib = i18n.langMap[this.locale];
            success && success(this.langlib);
        } else {
            this.load(this.locale).then((d: language) => {
                this.langlib = i18n.langMap[this.locale] = d;
                success && success(this.langlib);
            }).catch((err: language) => {
                error && error(err);
            })
        }
    }

    destroy():void{
        i18n.langMap = {};
        this.langlib = null;
        this.locale = null;
        this.baseURL = null;
    }

    t(s:string, setting?:{[prop:string]:string}):string{
        const list:Array<string> = s.split('.');
        let o:any = this.langlib;

        for(let i = 0, L = list.length ; i < L;i ++){
            const k:string = list[i];
            if(i < L && /\[(\w+)\]$/.test(k)){
                let x:number | string;
                let _k = k.replace(/\[(\w+)\]/,function(match:string, $1:string){
                    x = $1;
                    return '';
                });
                o = o[_k][x];
            }else{
                o = o[k];
            }
        }

        if(setting){
            return o.replace(/{(\w+)}/g,function(match:string, $1:string){
                return setting[$1] || match;
            });
        }else{
            return o;
        }
    }

    h(s:string, setting:{[prop:string]:string} = {}):string{
        const hands = this.t(s,setting);
        return `<${this.elTag} data-i18n-key="${s}" data-i18n-opt="${JSON.stringify(setting)}">${hands}</${this.elTag}>`;
    }

    re():void{
        const fonts: HTMLElement[] = document.querySelectorAll(`${this.elTag}[data-i18n-key]`);
        
        Array.from(fonts).forEach((el:HTMLElement)=>{
            const key:string = el.getAttribute('data-i18n-key');
            const opt:string = el.getAttribute('data-i18n-opt');

            el.innerText = this.t(key,JSON.parse(opt));
        });
    }
}

/**
 * 同步


const i18 = new i18n({
    locale: 'en',
    messages: {
        en: require('./en.json')
    },
    baseURL: '/lang/',
})

 * 
 */



/** 
 * const body = document.querySelector('body');
const i18 = new i18n({
    //locale: 'en',
    // messages: {
    //     en: require('./en.json')
    // },
    baseURL: '/lang/',
    suffix: 'js'
})
 * 
import('./en').then((d)=>{
    i18.setLanguage('en',d).then(()=>{
        console.time('num')
        body.innerHTML = i18.h('内容[1]');
        console.timeEnd('num')
    });
    
})

*/

export default i18n;