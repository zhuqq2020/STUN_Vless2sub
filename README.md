**## **基本介绍:************

适用于没有公网IP确想连接进家里局域网的情况<br>
优点:<br>
1、比CF的优选穿透效果好，低延迟。<br>
2、一次操作永久生效，无论STUN通道地址如何变只需要更新一次订阅即可<br>
缺点:<br>
暂时没发现

lucky的stun节点生成器操作步骤<br>
1、Openwrt创建好vless订阅节点V2ray 服务器、ShadowSocksR Plus+都有这功能，记录下uuid和端口号<br>
2、STUN内网穿透<br>
操作模式:简易模式<br>
穿透类型:IPv4-TCP<br>
规则名称:Vless10086 #自己的穿透规则<br>
目标地址:10.0.0.1 #openwrt的地址<br>
目标端口:10800 #Vless端口<br>
2、动态域名<br>
备注:VLESS10086<br>
记录名:vless10086.us.kg<br>
同步开关:启用<br>
记录类型:TXT<br>
记录内容:{STUN_VLESS10893_ADDR}<br>
TTL:自动<br>
3、打开[https://subcreat.zhuqq.pp.ua]()<br>
UUID输入vless的uuid<br>
TXT 动态域名：输入包含txt的动态域名<br>
点击订阅即可。建议自动更新周期设置短一些一应对通道变更。
