# WEPY

## 初期配置

### wepy 中使用 weui

这里需要注意一下，要用 [weui-wxss](https://github.com/Tencent/weui-wxss) 这个包，[weui](https://github.com/Tencent/weui) 这个包是给 web 端用的，里面有一些多余的东西，比如里面两个 * 通配符选择器，小程序并不支持。

将 weui-wxss 的 src/style 文件夹复制到 wepy 的 src 目录下，然后在 app.wpy 下引用即可。
``` vue
// app.wpy
<style lang="less">
@import './style/weui.less';
</style>
```

### 添加 sass 支持

- 安装 `npm install @wepy/compiler-sass -D`
- 在 `wepy.config.js` 中 `compilers` 里的添加 `sass`：
  ``` js
  compilers: {
    sass: {
      'outputStyle': 'compressed'
    },
  }
  ```
- 将 wpy 中 style 标签的语言改为 scss `<style lang="scss">`
- weui 的源码是 less 的，就先不删 less 了。

### 使用 vetur 为 wpy 文件提供代码高亮

首先用 vscode 打开任意一个 wpy 文件，一开始会以纯文本方式显示 wpy 文件，点击右下角的 `plain Text`，然后选择 `Configure File Association for '.wpy'`，再选择 vue 即可。

不过直接用的话会有一堆报错，需要关闭 vetur 的代码检查，在项目根目录创建 `vetur.config.js` 文件，写入一些只对当前项目生效的配置。
``` js
// vetur.config.js
/** @type {import('vls').VeturConfig} */
module.exports = {
  settings: {
    "vetur.validation.script": false,
    "vetur.validation.template": false,
    "vetur.validation.style": false,
  },
  projects: [
    './src'
  ]
}
```
另一种方法是把所有 wpy 文件都重命名为 vue，再在 `wpy.configjs` 里把 `wpyExt: '.wpy'` 改成 `wpyExt: '.vue'` ，不过这样在加载其他 wpy 模板时是不是每次都要修改呢？不了解。

## 使用 eslint 时报错 Accessing non-existent property 

不知道问题出在哪里，看起来像是哪个依赖在调用 linux 命令行。

``` js
(node:14788) Warning: Accessing non-existent property 'cat' of module exports inside circular dependency
(Use `node --trace-warnings ...` to show where the warning was created)
(node:14788) Warning: Accessing non-existent property 'cd' of module exports inside circular dependency
(node:14788) Warning: Accessing non-existent property 'chmod' of module exports inside circular dependency
(node:14788) Warning: Accessing non-existent property 'cp' of module exports inside circular dependency
(node:14788) Warning: Accessing non-existent property 'dirs' of module exports inside circular dependency
(node:14788) Warning: Accessing non-existent property 'pushd' of module exports inside circular dependency
(node:14788) Warning: Accessing non-existent property 'popd' of module exports inside circular dependency
(node:14788) Warning: Accessing non-existent property 'echo' of module exports inside circular dependency
(node:14788) Warning: Accessing non-existent property 'tempdir' of module exports inside circular dependency
(node:14788) Warning: Accessing non-existent property 'pwd' of module exports inside circular dependency
(node:14788) Warning: Accessing non-existent property 'exec' of module exports inside circular dependency
(node:14788) Warning: Accessing non-existent property 'ls' of module exports inside circular dependency
(node:14788) Warning: Accessing non-existent property 'find' of module exports inside circular dependency
(node:14788) Warning: Accessing non-existent property 'grep' of module exports inside circular dependency
(node:14788) Warning: Accessing non-existent property 'head' of module exports inside circular dependency
(node:14788) Warning: Accessing non-existent property 'ln' of module exports inside circular dependency
(node:14788) Warning: Accessing non-existent property 'mkdir' of module exports inside circular dependency
(node:14788) Warning: Accessing non-existent property 'rm' of module exports inside circular dependency
(node:14788) Warning: Accessing non-existent property 'mv' of module exports inside circular dependency
(node:14788) Warning: Accessing non-existent property 'sed' of module exports inside circular dependency
(node:14788) Warning: Accessing non-existent property 'set' of module exports inside circular dependency
(node:14788) Warning: Accessing non-existent property 'sort' of module exports inside circular dependency
(node:14788) Warning: Accessing non-existent property 'tail' of module exports inside circular dependency
(node:14788) Warning: Accessing non-existent property 'test' of module exports inside circular dependency
(node:14788) Warning: Accessing non-existent property 'to' of module exports inside circular dependency
(node:14788) Warning: Accessing non-existent property 'toEnd' of module exports inside circular dependency
(node:14788) Warning: Accessing non-existent property 'touch' of module exports inside circular dependency
(node:14788) Warning: Accessing non-existent property 'uniq' of module exports inside circular dependency
(node:14788) Warning: Accessing non-existent property 'which' of module exports inside circular dependency
```