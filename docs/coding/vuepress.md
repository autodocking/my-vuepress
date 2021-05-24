# VUEPRESS

::: tip 这里是 vuepress 日志专区
[官方文档在此](https://vuepress2.netlify.app/zh/)
:::

## vuepress2 官方插件的安装
以 [search](https://www.npmjs.com/package/@vuepress/plugin-search?activeTab=versions) 为例，其 latest 版本是 1.x.x 而 next 版本是 2.x.x，安装时候就需要在末尾加上 @next
``` sh
npm i @vuepress/plugin-search@next -D
```

## esbuild 导致 vuepress@next dev 和 build 失败

切换到 vuepress2 ，npm run dev 和 npm run build 都一直失败，提示 292 错误。
``` js
info Initializing VuePress and preparing data...
⠙ Compiling with webpack...events.js:292
      throw er; // Unhandled 'error' event
      ^

Error: spawn C:\node\vuepress-next\node_modules\esbuild\esbuild.exe ENOENT
    at Process.ChildProcess._handle.onexit (internal/child_process.js:269:19)
    at onErrorNT (internal/child_process.js:465:16)
    at processTicksAndRejections (internal/process/task_queues.js:80:21)
Emitted 'error' event on ChildProcess instance at:
    at Process.ChildProcess._handle.onexit (internal/child_process.js:275:12)
    at onErrorNT (internal/child_process.js:465:16)
    at processTicksAndRejections (internal/process/task_queues.js:80:21) {
  errno: -4058,
  code: 'ENOENT',
  syscall: 'spawn C:\\node\\vuepress-next\\node_modules\\esbuild\\esbuild.exe',
  path: 'C:\\node\\vuepress-next\\node_modules\\esbuild\\esbuild.exe',
  spawnargs: [ '--service=0.9.7', '--ping' ]
}
```
错误中还提到了 esbuild.exe ，查了下还真是 esbuild 的原因，文件夹中没有 exe 文件，只有 js 文件，需要在 vuepress 目录下手动运行一下：
``` sh
node ./node_modules/esbuild/install.js
```

## 手机模式缩放不正确的问题

当文章中存在过长的英文，例如文件地址等，不会做断行处理，这样页面的宽度将变成这行英文的长度，虽然手机端点开页面时缩放是正常的，但当双击屏幕时页面将缩小以显示这一整行英文，从而影响正常缩放。为了避免这种情况，就只能尽量把长英文放进代码块中，而不是写成行内代码或直接写入正文。

## 黑幕 .heimu

模仿萌娘百科的 heimu 样式，鼠标悬停时显示，~~鼠标没悬停时，字体颜色同背景色从而达到隐藏的目的，内部元素继承（inherit）父级的字体颜色。当显示时，链接和行内代码的颜色需要重新定义一下，链接：[ a link here ](#黑幕-heimu)，行内代码：`some in-line code here`。替换的是删除线的样式，也就是 `<s></s>` 标签的样式，markdown 里在两端加波浪线即可：`~~要加删除线的内容~~`。~~ 另外，为了防止触屏误触链接，给链接加了下划线。

``` scss
// .vuepress/styles/index.scss
.theme-default-content {
  s {
    background-color: #282c34;
    text-decoration-line: none;
    color: #282c34;
    padding: 0.1rem 0.5rem;
    * {
      color: inherit;
    }
    code {
      padding: 0.1rem 0.5rem;
    }
    a {
      text-decoration: underline dotted #3eaf7c;
    }
    &:hover {
      color: #fff;
      transition: 0.13s linear;
      a {
        color: #3eaf7c;
        background-color: #282c34;
        text-decoration: underline #3eaf7c;
        transition: 0.13s linear;
      }
      code {
        color: #87a5c2;
        background-color: #000;
        transition: 0.13s linear;
      }
    }
  }
}
```

::: details stylus 格式
``` stylus
// .vuepress/styles/index.styl
.theme-default-content
    s
        background-color: #282c34
        text-decoration-line: none
        color: #282c34
    s *
        color: inherit
    s:hover
        color: #fff
        transition: color .13s linear
    s:hover a
        color: #3eaf7c
        transition: color .13s linear
    s:hover code
        color: #87A5C2
        transition: color .13s linear
```
:::



## 内置搜索在遇到重复值时报错
例如两个h3标题，一个是“2020年11月”，另一个是“2020年11月1日”，搜索2020时，两个都能搜到，但是点击第一个，就会报错：`vue-router.esm.js?8c4f:2008 Uncaught (in promise) NavigationDuplicated: Avoided redundant navigation to current location: "/notes/#_2020年11月".`，这应该是html页内跳转规则的问题，总之避免标题和另外的标题开头重复吧。

## sidebar-button 在无css情况下，全屏显示的问题

当页面未加载css时，使用svg绘制的侧栏按钮会铺满整个屏幕，会占满用户的第一个屏幕，完全无法阅读。这里需要加个 max-width 属性：

> 你可以通过 `[tagName, { attrName: attrValue }, innerHTML?]` 的格式来添加标签。
[官方文档 - HeadConfig](https://vuepress2.netlify.app/zh/reference/config.html#head)

<CodeGroup>
  <CodeGroupItem title="config.js">

``` js
// .vuepress/config.js
module.exports = {
  head: [
    ['style', {}, '.toggle-sidebar-button .icon{max-width: 3rem;} .back-to-top{max-width: 3rem;}'],
  ],
}
```

  </CodeGroupItem>
  <CodeGroupItem title="渲染结果">

``` html
<head>
  <style>.toggle-sidebar-button .icon{max-width: 3rem;} .back-to-top{max-width: 3rem;}</style>
</head>
```

  </CodeGroupItem>
</CodeGroup>

::: details 修改主题的方法（比较麻烦）

修改 SidebarButton.vue，在svg标签里加个`style="max-width:3rem"`限制一下最大宽度。使用方法同 vuepress 1.x 修改ICP脚标，还需要在.vuepress/theme/index.js中引用一下默认主题。

``` js
// .vuepress\theme\components\SidebarButton.vue
<template>
  <div
    class="sidebar-button"
    @click="$emit('toggle-sidebar')"
  >
    <svg
      class="icon"
      style="max-width:3rem"
```
:::

## 在默认主页footer里加入ICP脚标
``` md
<!-- /docs/README.md -->
---
home: true
footer: <a target="_blank" rel="noopener noreferrer" href="http://beian.miit.gov.cn/">晋ICP备17011263号-2</a><a target="_blank" rel="noopener noreferrer" href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=14080202000391"><img src="/images/gongan.png" alt="" />晋公网安备14080202000391号</a>
footerHtml: true
---
```
``` scss
// .vuepress/styles/index.scss
.home {
  .footer {
    padding: 0;
    user-select: none;
    width: 90%;
    position: fixed;
    bottom: 0;
    left: 5%;
    padding: 8px 0;
    a {
      font-weight: 300;
      padding: 0 8px;
      color: #4e6e8e;
      line-height: 28px;
      text-decoration: none;
      white-space: nowrap;
      display: inline-block;
      img {
        position: relative;
        top: 4px;
        opacity: 0.8;
      }
    }
  }
}
```
::: details vuepress 1.x
首页的md文件里的YAML格式配置是无法实现的，因为源代码就是只处理文本，需要修改Home.vue模板文件。`.vuepress`目录里并没有模板，需要自己去[vuepress 默认主题 git](https://github.com/vuejs/vuepress/tree/master/packages/%40vuepress/theme-default)下载一份。
    
```{10}
目录结构：
.vuepress
├─ config.js
├─ public
│  ├─ img
│  │  └─ logo.png
│  └─ logo.png
└─ theme
    ├─ components
    │  └─ Home.vue
    └─ index.js
```

直接给它写死了：

``` html {4-5}
<!-- <div v-if="data.footer" class="footer">
    {{ data.footer }}
</div> -->
<div class="footer">
    <a target="_blank" rel="noopener noreferrer" href="http://beian.miit.gov.cn/">晋ICP备17011263号-2</a>
</div>
```

只把修改过的文件放进相应的文件夹里也是可以的，渲染时会自动替换文件。但是要注意，只要theme文件夹存在，默认主题将完全失效，所以只放置部分文件时，还需要在`.vuepress/theme/index.js`中引用一下默认主题：

``` js {3}
// .vuepress/theme/index.js
module.exports = {
    extend: '@vuepress/theme-default'
}
```
:::

## dev 模式配置文件修改后的热重载问题

vuepress的dev模式可以实时看到编辑效果（vscode上保存文件后，浏览器上立刻就能看到渲染后的页面）。但是如果修改的是配置文件， ~~或者md头部的YAML参数（vuepress2 已经可以热重载 frontmatter 了），~~ 并不会重新构建网页，修改的内容只有终止当前进程，重新 `npm run dev` 才可以看到修改后的效果。

## markdown 和 html 可以混写

bing搜索框：

<form action="https://cn.bing.com/search" target="_blank" method="get"  >
  <input type="text" id="search-input" name="q" placeholder="请输入要搜索的内容：" value="cat">
  <input type="submit" id="search-button" value="bing搜索">
</form>

``` html
<form action="https://cn.bing.com/search" target="_blank" method="get"  >
  <input type="text" id="search-input" name="q" placeholder="请输入要搜索的内容：" value="cat">
  <input type="submit" id="search-button" value="bing搜索">
</form>
```
