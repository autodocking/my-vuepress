# 云开发

腾讯云 - 云开发

## 静态网站托管开启防盗链设置后，导致网页无法访问

具体原理没有去深究，我用的是 `白名单 referer` 模式，添加了 `*.sleepycat.xyz` ，但是首页无法打开。猜测可能是直接打开时没有 referer 信息，所以被拒绝？然后这个防盗链是设计成在有自有服务器的情况下，从这里拉资源这种情况？后续再研究。

## wx-server-sdk

wx-server-sdk 可以在任何地方访问小程序的云环境，只要填入环境id 和 API密钥就可以了。在控制台新建一个子用户，然后为其设置 API 密钥，就可以获得 secretId 和 secretKey 。
[控制台地址](https://console.cloud.tencent.com/cam)

``` js
const cloud = require('wx-server-sdk');
cloud.init({
    env: 'xxxxx',
    secretId: 'xxxxx',
    secretKey: 'xxxxx'
});
```

## 云函数时区设置

云函数中的时区为 UTC+0，不是 UTC+8。如果需要默认 UTC+8，可以配置函数的环境变量，设置 TZ 为 Asia/Shanghai。
[官方文档 - 注意事项](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/functions/notice.html)

## 开通CDN后http访问报错

在“云开发-环境-HTTP访问服务”里绑定的自定义域名，访问 http 页面，返回的是一个 xml 文件，大致内容是 `UserCnameInvalid. Your cname does not exist or format illegal.`。问过后台人员，说是原本是只支持 https ，至于会不会开 http 还在讨论。解决办法是：在绑定自定义域名那个页面开启“强制HTTPS”。

## 云环境自定义域名，不能正确跳转静态托管的404错误页（未解决）

在“云开发-环境-HTTP访问服务”里绑定的自定义域名，HTTP访问服务里根目录设置的是静态托管，静态托管配置的跳转规则是错误代码404跳转404.html。

此时访问自定义域名，在浏览器上，会301跳转到`CDN存储桶名称.cos-website.ap-shanghai.myqcloud.com/404.html`这个地址上，而这个域名是不允许直接访问的，会始终返回`402 Payment Required`错误。而在postman测试是返回 403 Forbidden AccessDenied。

提交工单，回复是暂时无法解决，

## 添加自定义域名，CDN的CNAME一直是分配中状态

其实是我被误导了，之前在配置静态网址托管自定义域名时，绑定域名后就直接分配好CDN了，弄得我以为这是个自动过程，其实流程应该时这样的：

1. HTTP服务里绑定自定义域名
2. 将自定义域名的CNAME解析到云开发的默认域名上
3. 等待系统分配CDN的CNAME（这一步应该是腾讯云要判断域名是否可以正常解析，但是提示太少，只是在“添加域名”的弹框里提示：`3. 请确定自定义的域名已配置 CNAME 解析到默认域名`，主页面就只告诉你：`分配中`，有那么点误导的感觉，如果你不再添加新域名了，那你就永远看不到提示说明了）。
4. 将自定义域名的CNAME修改为刚分配的CDN-CNAME，等待十几分钟

注意：
* 在静态网站托管里面绑定域名，这个域名就只能访问静态网站的内容
* 在“环境-HTTP访问服务”中绑定域名，就可以通过分配路径，访问云函数、云托管了，但是无法正常404跳转
* 根域名和www.域名要分别绑定，两者CDN的CNAME是不一样的，都有5G的免费额度，在[CDN控制台-云开发](https://console.cloud.tencent.com/cdn/tcb)可用看到使用量，我试过将www.域名的CNAME解析到根域名上，CDN会报错
* 绑定是唯一的，自定义域名绑定到云环境后，不能再次绑定到静态托管上。


## 静态网站托管的 Last-Modified 时区错误（未解决）

例如：在静态文件中上传一个文件，可在控制台里看到修改时间是 `2020-12-04 28:37` 。请求时，HEAD中返回的是: `Last-Modified: Fri, 04 Dec 2020 23:28:37 GMT`，应该返回 15:28:37 GMT 才对，同时HEAD中也返回 Expires 时间，会造成文件上传8h内，Expires 时间比 Last-Modified 时间要早（过期时间比最后更新时间要早）。

并不影响二次请求时服务器返回 304 Not Modified。暂时还不清楚会造成哪些BUG，估计是不会有什么BUG，要不官方早去修复了。