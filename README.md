# 纯js的国际化语言插件

针对开发插件库，或者不使用vue、react、angular等框架想要实现国际化

## 功能

+ 支持json，js格式
+ 嵌套层级，可使用数组
+ 同步/异步加载方案
+ 可设置模板字段


## 兼容性  

ie9+    

## 快速使用

安装
<code>
&nbsp;npm i @xiui/i8n -S
</code>

使用

假设有以下json
<pre>
{
    "头部": {
        "注册": "注册",
        "登录": "登录"
    },
    "内容": [
        "红烧肉",
        "糖醋鱼",
        "拍黄瓜",
        "油炸{food}"
    ]
}
</pre>

### 同步


<pre>
import I18n from '@xiui/i18n';

const i18 = new I18n({
    locale: 'en',
    messages: {
        zh-CN: require('./zh-CN.json'),
        en: require('./en.json')
    }
});

const body = document.querySelector('body');
body.innerHTML = i18.h('头部.注册');

</pre>  


### 异步

需指导文件加载目录（静态目录）    
<b>注意：此时then方法是i18n原型方法，并不是Promise的then</b>
<pre>
import I18n from '@xiui/i18n';

const i18 = new I18n({
    locale: 'en',  //localStorage.getItem('locale')
    baseURL: '/lang/',
}).then(()=>{
    const body = document.querySelector('body');
    body.innerHTML = i18.h('头部.注册');
});

</pre>

如果使用异步想返回一个Promise对象可以使用 i18.setLanguage('en')

<pre>
import I18n from '@xiui/i18n';

const i18 = new I18n({
    baseURL: '/lang/',
});

i18.setLanguage('en').then(()=>{
    body.innerHTML = i18.h('头部.注册');
});

</pre>


## 进阶

###配置项   
<code>
  new I18n(option)
</code>

<pre>

option = {
    locale?: string;     //使用的语言
    messages?: LangMap;  //语言包配置
    baseURL?: string;    //异步加载请求地址，根目录开始
    elTag?: string;      //使用 h函数生成标签名，默认font
    suffix?: string;     //加载语言包 文件后缀名  默认json
}

interface LangMap {
    [propName: string]: object
}

</pre>  

### 方法


<code>
  i18.t(s:string, option?:object)
</code>

s: key值匹配，嵌套层级使用.来访问 ， 数组使用[0] 来访问，数字代表索引   
option: 模板字段匹配，可以将变量插入到语言中

<pre>
i18.t('头部.注册');  //=>注册
i18.t('内容[2]');    //=>拍黄瓜
i18.t('内容[3]',{    //=>油炸大虾
  food: '大虾'
});    
</pre>

<code>
  i18.h(s:string, option?:object)
</code>

与i18.t参数一样，唯一区别会加入font标签，更改标签 配置 elTag   
在动态改变语言时推荐使用这个，避免所有元素重载切换，内部原理就是会在标签上加入配置属性，当改变语言后 自动获取所有配置标签，并改变。

<code>
i18.setLanguage(locale: string,language?: language)
</code>

切换语言，locale语言类型，language语言包，不传为异步加载，返回promise对象
会自动获取 i18.h 函数生成的文本进行改变

## 问答

q: 不想把语言包放在静态目录下，想通过webapck打包该怎么做
a: 可以使用 import() 函数，加载语言包后 调用  i18.setLanguage(locale,response);

<pre>
import('./en').then((d)=>{
    i18.setLanguage('en',d).then(()=>{
        body.innerHTML = i18.t('内容[1]');
    });
})  
</pre>
