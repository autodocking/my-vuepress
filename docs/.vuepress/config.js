const path = require('path')

const codingRoutes = [
  '/coding/vuepress.md',
  '/coding/vue.md',
  '/coding/miniprogram.md',
  '/coding/cloudbase.md',
  '/coding/markdown.md',
  '/coding/centos.md',
]

const toolsRoutes = [
  '/tools/boss-timer.md',
  '/tools/excel-fix.md',
]

module.exports = {
  lang: 'zh-CN',
  title: '学习日志',
  head: [
    ['link', { rel: 'icon', type: 'image/png', size: '32x32', href: '/img/icons/favicon-32x32.png' }],
    ['link', { rel: 'icon', type: 'image/png', size: '16x16', href: '/img/icons/favicon-16x16.png' }],
    ['link', { rel: 'manifest', href: '/manifest.webmanifest' }],
    ['meta', { name: 'theme-color', content: '#fff' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: '#fff' }],
    ['link', { rel: 'apple-touch-icon', href: '/img/icons/apple-touch-icon-152x152.png' }],
    ['link', { rel: 'mask-icon', href: '/img/icons/safari-pinned-tab.svg', color: '#fff' }],
    ['meta', { name: 'msapplication-TileImage', content: '/img/icons/msapplication-icon-144x144.png' }],
    ['meta', { name: 'msapplication-TileColor', content: '#fff' }],
    ['style', {}, '.toggle-sidebar-button .icon{max-width: 3rem;} .back-to-top{max-width: 3rem;}'],
  ],
  description: '这是一个 VuePress 站点',
  themeConfig: {
    logo: '/img/hero.svg',
    navbar: [
      {
        text: '日志',
        children: [
          '/journal/2021.md',
          '/journal/2020.md',
        ],
      },
      {
        text: '代码学习',
        children: codingRoutes,
      },
      {
        text: '工具箱',
        children: toolsRoutes
      },
    ],
    sidebar: [
      {
        isGroup: true,
        text: '日志',
        children: ['/journal/2021.md', '/journal/2020.md'],
      },
      {
        isGroup: true,
        text: '代码学习',
        children: codingRoutes,
      },
      {
        isGroup: true,
        text: '工具箱',
        children: toolsRoutes,
      },
    ],
    contributors: false,
    lastUpdatedText: '最后更新',
    notFound: ['您访问的页面可能已删除、更名或暂时不可用。'],
    backToHome: '返回首页',
    repo: 'autodocking/my-vuepress',
    editLink: false,
  },
  markdown: {
    code: {
      lineNumbers: false
    },
  },
  plugins: [
    [
      '@vuepress/plugin-search',
      {
        locales: {
          '/': {
            placeholder: '搜索',
          },
        },
      },
    ],
    ['@vuepress/plugin-pwa'],
    [
      '@vuepress/plugin-pwa-popup',
      {
        locales: {
          '/': {
            message: '发现新内容可用',
            buttonText: '刷新',
          },
        },
      },
    ],
    [
      '@vuepress/register-components',
      {
        componentsDir: path.resolve(__dirname, './components'),
      },
    ],
  ],
  port: 8081,
}