# ESLINT

## 使用 eslint 时出现 Accessing non-existent property 报错

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