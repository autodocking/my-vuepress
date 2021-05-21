# VUE3

::: tip 这里是 vue 日志专区
[官方文档在此](https://v3.cn.vuejs.org/)
:::

## PWA

### skipwaiting

自动生成的 service-worker.js 文件中有个根据 message.data.type 判断是否要 skipwaiting 的，那么这个 message 又从哪里来呢？

``` js
// service-worker.js
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
```

### 如何发出 'SKIP_WAITING' 消息

用这一行就可以发出所需的 message，不过还是让用户去手动点击更新好点，参考 vue 官网的方式。
``` js
navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING'});
```
### 手动更新组件

参考文章：
- [Handling Service Worker updates in your Vue PWA](https://dev.to/drbragg/handling-service-worker-updates-in-your-vue-pwa-1pip)（通过传递 CustomEvent 让用户手动更新）

我把这个做成了一个组件

STEP 1：在 `src/registerServiceWorker.js` 中为 `updated()` 添加自定义 event

``` js
// registerServiceWorker.js
updated(registration) {
  console.log('New content is available; please refresh.')
  document.dispatchEvent(
    new CustomEvent('swUpdated', { detail: registration })
  )
},
```

STEP 2：组件 `src/components/UpdateSW.vue`。我这里用了 `bootstrap.css` 。

``` vue
<template>
  <div class="sw-update-popup shadow py-3 px-4 text-center bg-white rounded" v-if="updateExists">
    <div class="mb-1">新内容可用</div>
    <button class="btn btn-primary btn-sm px-3 text-white" @click="refreshApp">刷新</button>
  </div>
</template>

<script>
export default {
  name: 'UpdateSW',
  // copy https://dev.to/drbragg/handling-service-worker-updates-in-your-vue-pwa-1pip
  data() {
    return {
      refreshing: false,
      registration: null,
      updateExists: false,
    }
  },
  created() {
    document.addEventListener('swUpdated', this.updateAvailable, { once: true })
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (this.refreshing) return
      this.refreshing = true
      window.location.reload()
    })
  },
  methods: {
    updateAvailable(event) {
      this.registration = event.detail
      this.updateExists = true
    },
    refreshApp() {
      this.updateExists = false
      if (!this.registration || !this.registration.waiting) return
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    },
  },
}
</script>

<style lang="scss" scoped>
.sw-update-popup {
  position: fixed;
  right: 2rem;
  bottom: 7rem;
  z-index: 4;
}
</style>
```

STEP 3：在 `src/App.vue` 中加载该组件

``` vue {3,7,12}
<template>
  <router-view />
  <UpdateSW />
</template>

<script>
import UpdateSW from '@/components/UpdateSW.vue'
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'App',
  components: {
    UpdateSW
  }
})
</script>
```

### 从本地加载 workbox-sw.js

`service-worker.js` 里面有一行是从 google 服务器调用 `workbox-sw.js`，这个不会被墙吗？不会吗？

``` js
importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");
```

可以将 `importWorkboxFrom` 设为 `locoal`，build 时会自动在根目录下创建一个 `workbox-v4.3.1` 目录。

``` js {4-6}
// vue.config.js
module.exports = {
  pwa: {
    workboxOptions: {
      importWorkboxFrom: 'local'
    }
  }
}
```

`workbox-v4.3.1` 目录总共64个文件，里面加上 map 文件总共 1.26Mb，不过不在 `precache-manifest.js` 的预加载名单里。这些文件都是必要的吗，怎样去掉 map 文件，这样设置会有什么不好的地方？
[源码](https://github.com/GoogleChrome/workbox/blob/v4.3.1/packages/workbox-webpack-plugin/src/lib/get-workbox-sw-imports.js)
中说会对 `webpack-dev-server` 有些影响。

参考文章：
- [How to configure importScript when using vue-cli-pwa plugin](https://stackoverflow.com/questions/64605755/how-to-configure-importscript-when-using-vue-cli-pwa-plugin)

## vue 文件中 html 标签属性和 js 语句被过度折叠

用的 Vetur 插件进行 vue 文件的格式化，本来屏幕很大的，但就是给你折成很多行，最终只显示在半个屏幕上，而且因为用了 bootstrap，每个 class 都很长，基本上是个标签都要给你折个行，内嵌 svg 之类的更严重，看着贼难受。

Vetur 用的是 Prettier，只需要修改一下 prettier.printWidth 参数即可，默认是 80 个字符。更多设置见[官方文档](https://prettier.io/docs/en/options.html#print-width)。
``` js
// settings.json of vs-code
"vetur.format.defaultFormatterOptions": {
    "prettier": {
        "printWidth": 160
    }
}
```

## 哪些链接在构建的时候会替换前缀?

我现在把 vue 项目放在 /tools/ 目录下，开发环境没问题，但在是构建之后地址前缀并没有变，就使得 svg 引用不到图片。其实直接地址上带上 /tools/ 前缀就可以，在开发环境也能正常显示图片的，第三种写法则便于后期变更 BASE_URL 。~~话说之前在 setup() 中一直用 computed() 来获取常量，原来直接赋值就可以……~~

``` html
<!-- 不可 -->
<svg><use xlink:href="/img/icons.svg#logo"></use></svg>

<!-- 可 -->
<svg><use xlink:href="/tools/img/icons.svg#logo"></use></svg>

<!-- 可 -->
<svg><use :xlink:href="publicPath + 'img/icons.svg#logo'"></use></svg>
<script>
  setup() {
    return { 
      publicPath: process.env.BASE_URL
    }
  }
</script>
```
