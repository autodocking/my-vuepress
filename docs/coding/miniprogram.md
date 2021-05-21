# 微信小程序

## 关于许可

笔记：小程序内涉及提供自定义内容的记录及分享，包括文字、图片、视频、音频等服务，需补充社交-笔记类目。
[原文地址](https://developers.weixin.qq.com/community/develop/doc/000a46b64e00a8aaa8a95bf3456809?highLine=%25E7%25A4%25BE%25E4%25BA%25A4)

所需资质（2选1）：
- 《非经营性互联网信息服务备案核准》
- 《组织机构代码证》或《统一社会信用代码证》（适用于政府主体）

那么，以个人主体进行ICP备案的域名，是否可以用于社交类小程序？

## 关于 tabbar

试过 weui-wxss 的 tabbar，单纯靠 weui.wxss ，可以做成单页的，切换 tab 时让某个的view显示，其他的全隐藏，而不是去切换页面，切换的时候就很顺溜。图标还能用 mp-icon 组件里的，不像官方组件只能用图片。
[weui.wxss官方git代码](https://github.com/Tencent/weui-wxss/blob/master/dist/example/tabbar/tabbar.wxml)
，不过自定义 tabbar 不能跟随系统发出触摸提示音，操作反馈太弱了，自己添加音效又可能被不爱开触摸提示音的用户嫌弃，还是直接用官方组件好了，跟随系统……

## 关于 userInfo

服务端是可以直接从微信服务器获取 userInfo 的，不需要前端传给后端。

用户点击带 `open-type="getUserInfo"` 的属性的按钮时，会获得明文的 userInfo 和 encryptedData （其中不包含 openId），然后需要发送这个 encryptedData 到服务端，服务端需要用到 appId sessionKey iv 这三样东西来解密数据，可以解密出 userInfo，其中包含用户昵称、头像链接、openId 和 unionId 等，iv 是随 encryptedData 一起给用户的，而 sessionKey 需要通过用户调用 wx.login 获取 code，用户将 code 发送给服务器，服务器再通过 code 获得 sessionKey。用户没有 sessionKey，所以无法解密出自己的 openId。以上是外部服务器的情况，
[官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/signature.html#%E5%8A%A0%E5%AF%86%E6%95%B0%E6%8D%AE%E8%A7%A3%E5%AF%86%E7%AE%97%E6%B3%95)
中有提供解密代码。

[官方文档 - 方式二](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/signature.html#%E5%8A%A0%E5%AF%86%E6%95%B0%E6%8D%AE%E8%A7%A3%E5%AF%86%E7%AE%97%E6%B3%95)
还提供了云函数中直接获取 opendata 的方法：如果开启了云开发功能，用户通过 `open-type="getUserInfo"` 获得的数据中会包含一个 cloudID，把这个传给云函数，然后在云函数里通过 cloud.getOpenData() 来获取数据，这个方法只需要有 cloudID 即可，cloudID 有效期是 5 分钟。

``` js
// 小程序端
wx.cloud.callFunction({
            name: 'login',
            data: {
                cloudID: e.detail.cloudID
            },
        ...
// 云函数
const res = await cloud.getOpenData({
    list: [event.cloudID]
})
```


## WeUI 组件库

[github项目地址](https://github.com/wechat-miniprogram/weui-miniprogram)
[官方文档](https://developers.weixin.qq.com/miniprogram/dev/extended/weui/)

官方文档中介绍，通过 useExtendedLib 扩展库 的方式引入，可省略 weui.wxss 的 import 步骤 ~~，也仅仅是指官方组件可以省略，如果有其它地方用到 weui.wxss，还是要 import 引入的。~~ ，实际测试也确实是可以不用写 @import "weui.wxss"; 不过还是放一个在项目目录里比较好，方便查看，等熟悉了再删。
[官方git](https://github.com/Tencent/weui-wxss/blob/master/dist/style/weui.wxss)。

## 关于openId

openId 可以全程不提供给用户。

* 云函数 event 中的 userinfo.openid 是不可信的，因为它可以被用户回传信息中的 userinfo 覆盖，应当通过微信上下文来获得 openid ，即：cloud.getWXContext().OPENID 。
* 前端直接进行数据库查询时，可以使用
['{openid}' 变量](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/database/security-rules.html#%E8%A7%84%E5%88%99%E5%8C%B9%E9%85%8D)
替代 openId 字符串，后台遇到该关键词时会自动替换，用户不必知道 openId 是多少。不过，通过 `where({_openid: '{openid}'})` 的方式获取的数据中又肯定包含 openid，有什么办法能过滤一下吗？

## 数据库的自定义权限

 [原问题地址](https://developers.weixin.qq.com/community/develop/doc/0002eabd088d7025586b808f151000)， 
 当设置 "doc._openid == auth.openid" 这条规则的时候  ，总是说无权限访问，经过测试，需要在 where 语句中指定 openid，如果不指定，这条规则将阻止用户访问数据库。

``` js
// 数据库权限
{"read": "doc._openid == auth.openid"}
// 查询语句中必须包含对应的键值
db.collection('xxx').where({_openid: 'xxxxxxxxxx'}).get()

// 数据库权限
{"read": "doc.key == '12321'"}
// 查询语句
db.collection('xxx')where({key:'12321'}).get()
```

[官方文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/database/security-rules.html#%E7%AE%80%E4%BB%8B)
中有详细说明，**简单来说 doc 就是用来判断 where 语句对不对的**。文档中说新安全规则下要求显式传入 openid，应该是为了避免数据库权限弄错时造成数据泄露吧，比如习惯于查询时不指明 openid，一旦数据库权限改为全体可读，那每次查询的结果就是整个数据库了。

如果不想给前端发送 openid，可以使用
[{openid} 变量](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/database/security-rules.html#%E8%A7%84%E5%88%99%E5%8C%B9%E9%85%8D)
来替换，前端使用`where({_openid: '{openid}'})` 时，后台会自动替换为小程序用户的 openid。

## wx:if vs hidden

wxml 中的 block 标签只用于 wx:if 或者 wx:for 条件判断，像 hidden 之类的属性对 block 是无效的。[官方文档 - 基础组件#公共属性](https://developers.weixin.qq.com/miniprogram/dev/framework/view/component.html#%E5%85%AC%E5%85%B1%E5%B1%9E%E6%80%A7)，[官方文档 - wx:if](https://developers.weixin.qq.com/miniprogram/dev/reference/wxml/conditional.html#wx:if%20vs%20hidden)，[Vue中v-if和v-show的使用场景](https://cn.vuejs.org/v2/guide/conditional.html#v-if-vs-v-show)

``` html
<!-- hidden 要这样用 -->
<view hidden="{{true}}"></view>

<!-- 这里的 hidden 是不会生效的 -->
<block hidden="{{true}}">
    <view></view>
</block>

<!-- 与 vue 的 v-if 和 v-show 一样，wx:if=false 时该元素将不存在，而 hidden 只是使其不可见 -->
<block wx:if="{{true}}">
    <view></view>
</block>
```
不过 hidden 的处理方式跟 v-show 还是有些差别，被隐藏的 view 在调试器里是这样显示的
``` css
view[hidden] {
    display: none;
}

view {
    display: block;
}
```

## 微信小程序 wx:for 循环

如果 wx:for-index 和 wx:for-item 不赋值，默认的关键词就是 index 和 item，而 wx:key 的作用同 [vue 中 v-bind:key 的作用](https://www.jianshu.com/p/4bd5e745ce95)，具体用法见
[官方文档](https://developers.weixin.qq.com/miniprogram/dev/reference/wxml/list.html)
。


``` js
// js
Page({
    data: {
        array: ['我', '们']
    }
}
```

``` html
<!-- wxml -->
<view wx:for="{{array}}" wx:for-index="a" wx:for-item="b">
    {{a}}:{{b}}
</view>
<!-- 下面的和上边是一样效果 -->
<view wx:for="{{array}}">
    {{index}}:{{item}}
</view>

<!-- 渲染结果 -->
<view>
    0:我
</view>
<view>
    1:们
</view>
```