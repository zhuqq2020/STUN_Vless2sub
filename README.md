# 基本介绍:

适用于没有公网IP确想连接进家里局域网的情况<br>

### 优点:<br>

1、比CF的优选穿透效果好，低延迟。<br>

2、一次操作永久生效，无论STUN通道地址如何变只需要更新一次订阅即可<br>

### 缺点:

暂时没发现

## 使用方法:

Cloudflare使用Workers部署即可

|  变量名     |  示例                                                                                                                                                                                                            |  备注                   |
| ------------- | ------------------------------------------------- | ------------------------- |
|  SUBAPI     |  subapi.cmliussss.net                                                                                                                                                                                            |  clash订阅转换后端      |
|  SUBCONFIG  |  [https://raw.githubusercontent.com/zhuqq2020/Mihomo-Party-ACL4SSR/refs/heads/ACL4SSR/STUN\_Vless2sub.ini](https://raw.githubusercontent.com/zhuqq2020/Mihomo-Party-ACL4SSR/refs/heads/ACL4SSR/STUN_Vless2sub.ini)  |  clash订阅转换配置文件  |
|  SUBNAME    |  STUN\_VLESS                                                                                                                                                                                                     |  订阅生成器的名称       |

#### lucky的stun节点生成器操作步骤<br>

**1、Openwrt创建好vless订阅节点V2ray 服务器、ShadowSocksR Plus+都有这功能，记录下uuid和端口号

2、STUN内网穿透

操作模式:简易模式

穿透类型:IPv4-TCP

规则名称:Vless10086 #自己的穿透规则

目标地址:10.0.0.1 #openwrt的地址

目标端口:10800 #Vless端口

2、动态域名

备注:VLESS10086

记录名:vless10086.us.kg

同步开关:启用

记录类型:TXT

记录内容:{STUN\_VLESS10893\_ADDR}

TTL:自动

3、打开[https://subcreat.zhuqq.pp.ua]()

UUID输入vless的uuid

TXT 动态域名：输入包含txt的动态域名

点击订阅即可。建议自动更新周期设置短一些一应对通道变更。**


