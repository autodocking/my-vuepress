# WEPY

## 初期配置

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
- weui 的源码是 less 的，所以就不删 less 了。

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
