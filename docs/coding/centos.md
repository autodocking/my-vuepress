# CentOS

## nginx

### lighthoust 下 nginx 的一些操作指令
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

还有，查询系统运行日志时，关键词得改成 snap

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