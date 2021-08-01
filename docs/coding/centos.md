# CentOS

## node.js

### 安装 node.js
首先上 [官网](https://nodejs.org/en/download/) 复制 Linux Binaries (x64) 64-bit 版本的下载链接，以 v16.5.0 为例：

``` sh
wget https://nodejs.org/dist/v16.5.0/node-v16.5.0-linux-x64.tar.xz
tar -xvf node-v16.5.0-linux-x64.tar.xz
mv node-v16.5.0-linux-x64 /usr/local/nodejs
# 添加软链接（快捷方式）到 path 中，以便直接在命令行运行 node，用 echo $PATH 可以看到 path 都包含哪些文件夹
ln -s /usr/local/nodejs/bin/node /usr/local/bin/node
ln -s /usr/local/nodejs/bin/npm /usr/local/bin/npm
ln -s /usr/local/nodejs/bin/npx /usr/local/bin/npx
```

### 安装 pm2
``` sh
npm i pm2 -g
ln -s /usr/local/nodejs/bin/pm2 /usr/local/bin/pm2
# 通过配置文件启动应用
pm2 start ecosystem.config.js
# 显示正在运行的任务列表
pm2 list
# 保存当前列表
pm2 save
# 设置开机启动，会自动创建 systemctl 服务
pm2 startup
```

``` js
// ecosystem.config.js
module.exports = {
apps: [{
  name: "koa-server",
  cwd: "/opt/koa-server/",
  script: "bin/www",
  restart_delay: 1000,
  max_restarts: 2,
  watch: true,
  ignore_watch: ["node_modules", ".git"],
  env: {
    NODE_ENV: "production",
    PORT: 3000,
  }
}]
}
```

### 安装 mongodb

yum 安装
``` sh
# 创建 mongodb-org-5.0.repo 文件
vi /etc/yum.repos.d/mongodb-org-5.0.repo
# 在文件中插入下面这些内容
```
```
[mongodb-org-5.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/$releasever/mongodb-org/5.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-5.0.asc
```
``` sh
yum install -y mongodb-org
systemctl start mongod
systemctl enable mongod
# 现在推荐使用 mongosh 而不是 mongo 命令了
mongosh
db.testCol.insertOne({'adb': 123})
show collections
db.getCollection('testCol').find()
db.getCollection('testCol').drop()
```

## nginx

### 安装最新版 nginx
``` sh
# 更新 yum 源
vi /etc/yum.repos.d/nginx.repo
```
```
[nginx-stable]
name=nginx stable repo
baseurl=http://nginx.org/packages/centos/$releasever/$basearch/
gpgcheck=1
enabled=1
gpgkey=https://nginx.org/keys/nginx_signing.key
module_hotfixes=true

[nginx-mainline]
name=nginx mainline repo
baseurl=http://mirrors.ustc.edu.cn/nginx/mainline/centos/$releasever/$basearch/
gpgcheck=0
enabled=1
module_hotfixes=true
```
``` sh
yum install nginx -y
systemctl enable nginx
systemctl start nginx
# 默认配置文件，不做更改
vi /etc/nginx/nginx.conf
# 自定义配置文件
vi /etc/nginx/conf.d/cloud.conf
# 测试配置文件
nginx -t
# 重载配置文件
nginx -s reload
```

### lighthoust 预装的 nginx
``` sh
# 编辑配置文件
vi /usr/local/lighthouse/softwares/nginx/conf/nginx.conf
# 编辑特定应用的配置，以 nextcloud 为例
vi /usr/local/lighthouse/softwares/nginx/conf/include/nextcloud.conf
# 测试配置文件
/usr/local/lighthouse/softwares/nginx/sbin/nginx -t
# 重载配置文件
/usr/local/lighthouse/softwares/nginx/sbin/nginx -s reload
```

## SELinux

SELinux 的全称是 SECURITY-ENHANCED LINUX，拥有更高的安全规则。当遇到 SElinux 相关问题时，好多网文都是建议永久关闭 SElinux，这样的文章真的有必要发出来吗。

临时关闭是用 `setenforce 0`。键入 `setenforce 1` 或者重启之后会恢复为 Enforcing 状态，用 `getenforce` 可以查看当前状态。

[官方文档在此](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/selinux_users_and_administrators_guide/chap-security-enhanced_linux-introduction)~~，简直就是天书。~~

### 在 SELinux 开启状态让 snap 应用开机启动

最近通过 snap 安装了个应用，想要开机启动，从网上找了下配置方法，但需要关闭 SELinux 才可以启动，开启 SELinux 时运行 systemctl 无法启动服务，日志里显示：Permission denied。

``` sh
# 创建服务
vi /lib/systemd/system/my-service-name.service

[Unit]
Description=my-service-description
After=network.target

[Service]
Restart=on-abnormal
ExecStart=/snap/bin/appname

[Install]
WantedBy=multi-user.target

# 启动服务
systemctl daemon-reload
systemctl restart my-service-name
systemctl status my-service-name
```
最后一行查看运行状态，是 failed，查 `journalctl -r | more` 提示是：Permission denied，于是我试着修改文件的 context ，但是都没用。

最后，修改了一下 ExecStart 路径，用 snap run xxx 的方式来运行，启动成功！
``` sh {9}
vi /lib/systemd/system/my-service-name.service

[Unit]
Description=my-service-description
After=network.target

[Service]
Restart=on-abnormal
ExecStart=/usr/bin/snap run appname

[Install]
WantedBy=multi-user.target
```
总结一下，应该是这样的：snap 是通过 yum 安装的，安装过程中进行了相应的 SELinux 权限配置，可以被 systemd 启动，而通过 snap 安装的 app 因为权限不全，所以无法直接被 systemd 启动，会被 SELinux 拦截。

由于是通过 snap 启动的应用，查询系统运行日志时，关键词得改成 snap。

其他一些命令

``` sh
# 查看文件的 context
ll -Z
# 分别是 user:role:type:level
-rwxrw-r--  user1 group1 unconfined_u:object_r:user_home_t:s0  file1

# 修改文件的 context
chcon -u system_u /lib/systemd/system/my-service-name.service

# 查看权限记录
cat /var/log/audit/audit.log | grep key-word

# 查看 systemd 对相应 type 的操作权限，需要先 yum install setools
sesearch -A -s NetworkManager_t -c service
```
[相关链接 SELINUX SYSTEMD ACCESS CONTROL](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/selinux_users_and_administrators_guide/chap-security-enhanced_linux-systemd_access_control)


### 在 SELinux 开启状态下修改 SSH 端口

如果修改 SSH 端口之前没有配置 SELinux，将导致 SSH 服务无法启动。

``` sh
# 查询当前 SELinux 认可的 SSH 端口
semanage port -l | grep ssh

# 添加一个自定义 SSH 端口
semanage port -a -t ssh_port_t -p tcp 1234

# 开放相应的防火墙端口
firewall-cmd --permanent --zone=public --add-port=1234/tcp
firewall-cmd --reload
firewall-cmd --zone=public --list-all

# 修改 SSH 配置文件，同时 22 端口将被自动禁用
vi /etc/ssh/sshd_config
Port 1234

# 重启 SSH 服务
systemctl restart sshd
systemctl status sshd
```
注意：在断开当前 SSH 连接之前，一定要确认一下 SSH 服务有没有正常重启，最好是用新端口登录一次，再关闭当前窗口。万一操作失误使得 SSH 无法连接，也不是完全没办法，还可以尝试通过服务商的网页控制台来连接服务器。