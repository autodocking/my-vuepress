# BOOTSTRAP

## 按钮背景颜色 hover 时是变浅还是变深

默认的蓝色按钮鼠标悬停时背景色是会变深的，但当我将主题色 `$primary` 改成了微信绿 `--weui-BRAND: #07c160;` 后，发现 `.btn-primary` 按钮文字的颜色变成黑色了，鼠标悬停时背景色会变浅，手动修改文字为白色，悬停时背景也依然会变浅，这时候对比度就太低了，看着难受。

先看源文件，按钮背景颜色在鼠标悬停时候变浅还是变深，首先看的是文字的颜色，而文字的颜色又是根据背景色决定的，其实说到底还是要看背景颜色是什么，这里面关键就是 `color-contrast()` 这个函数。

``` scss {6}
// node_modules\bootstrap\scss\mixins\_buttons.scss
@mixin button-variant(
  $background,
  $border,
  $color: color-contrast($background),
  $hover-background: if($color == $color-contrast-light, shade-color($background, $btn-hover-bg-shade-amount), tint-color($background, $btn-hover-bg-tint-amount)),
  $hover-border: if($color == $color-contrast-light, shade-color($border, $btn-hover-border-shade-amount), tint-color($border, $btn-hover-border-tint-amount)),
  $hover-color: color-contrast($hover-background),
  $active-background: if($color == $color-contrast-light, shade-color($background,$btn-active-bg-shade-amount), tint-color($background, $btn-active-bg-tint-amount)),
  $active-border: if($color == $color-contrast-light, shade-color($border, $btn-active-border-shade-amount), tint-color($border, $btn-active-border-tint-amount)),
  $active-color: color-contrast($active-background),
  $disabled-background: $background,
  $disabled-border: $border,
  $disabled-color: color-contrast($disabled-background)
  ...
```

来看 `color-contrast()` 函数，里面用到了 `$min-contrast-ratio` 参数，这个我们可以自定义。

``` scss {9}
// node_modules\bootstrap\scss\_functions.scss
@function color-contrast($background, $color-contrast-dark: $color-contrast-dark, $color-contrast-light: $color-contrast-light, $min-contrast-ratio: $min-contrast-ratio) {
  $foregrounds: $color-contrast-light, $color-contrast-dark, $white, $black;
  $max-ratio: 0;
  $max-ratio-color: null;

  @each $color in $foregrounds {
    $contrast-ratio: contrast-ratio($background, $color);
    @if $contrast-ratio > $min-contrast-ratio {
      @return $color;
    } @else if $contrast-ratio > $max-ratio {
      $max-ratio: $contrast-ratio;
      $max-ratio-color: $color;
    }
  }

  @warn "Found no color leading to #{$min-contrast-ratio}:1 contrast ratio against #{$background}...";

  @return $max-ratio-color;
}
```
Bootstrap 默认的 `$min-contrast-ratio` 对比度是 4.5，而微信绿 `--weui-BRAND: #07c160;` 是远远达不到的，即便是加深的微信绿 `--weui-TEXTGREEN: #06ae56;`，也需要降低 1% 明度，对比度才能达到 3。

如下这样设置的话，绿色按钮的文字就会默认为白色，鼠标悬停时，背景色会加深而不是变浅了。

``` scss
// src\app.scss
$green: hsl(149, 93%, 34%);
// change primary color to green
$primary: $green;
// The contrast ratio to reach against white, to determine if color changes from "light" to "dark". Acceptable values for WCAG 2.0 are 3, 4.5 and 7.
// See https://www.w3.org/TR/WCAG20/#visual-audio-contrast-contrast
$min-contrast-ratio: 3;
```

备注：vscode 中把鼠标悬停在 css 颜色上时会弹出 tooltip ，点击 tooltip 的标题，就可以在 RGB、16进制、hsl 三种模式下来回切换，这里如果想测试多深的颜色能达到设定的对比度，用 hsl 表达式会更方便点。

## vue3 中使用 bootstrap.scss

先安装 `npm i bootstrap`

在 main.js 中引入一个 scss 文件
``` js {4}
// src\main.js
import { createApp } from 'vue'
import App from './App.vue'
import './app.scss'
const app = createApp(App)
app.mount('#app')
```

在这个 scss 文件中先定义好变量，然后再引入 bootstrap.scss，就会覆盖掉 bootstrap 中的默认设置
``` scss {6}
// src\app.scss
// Define variable defaults
$green: hsl(149, 93%, 34%);
$primary: $green;
// import Bootstrap SCSS files
@import "../node_modules/bootstrap/scss/bootstrap.scss";
```