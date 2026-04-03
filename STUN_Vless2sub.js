export default {
  async fetch(request, env) { 
    const url = new URL(request.url);
    const { pathname, searchParams } = url;

    if (pathname === "/") {
      return new Response(html, { headers: { "content-type": "text/html;charset=UTF-8" } });
    }

    if (pathname === "/sub") {
      try {
        const uuid = searchParams.get("uuid");
        const hostParam = searchParams.get("host"); 
        const type = searchParams.get("type");

        if (!uuid || !hostParam) throw new Error("缺少必要参数");

        const SUBAPI = env.SUBAPI || "api.xx.us.kg"; 
        const SUBCONFIG = env.SUBCONFIG || "https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/config/ACL4SSR_Online_Full_MultiMode.ini";
        const SUBNAME = env.SUBNAME || "ssa.us.kg";

        const hosts = hostParam.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
        if (hosts.length === 0) throw new Error("无有效域名");

        let vlessLinks = [];
        for (const host of hosts) {
          const dnsProviders = [`https://dns.google/resolve?name=${host}&type=TXT`, `https://cloudflare-dns.com/query?name=${host}&type=TXT`];
          let txtRecord = null;
          for (const dnsUrl of dnsProviders) {
            try {
              const response = await fetch(dnsUrl, { headers: { "accept": "application/dns-json" } });
              if (!response.ok) continue;
              const data = await response.json();
              if (data.Answer && data.Answer.length > 0) {
                txtRecord = data.Answer[0].data.replace(/"/g, "").replace(/\s/g, "");
                if (txtRecord) break;
              }
            } catch (e) { continue; }
          }

          if (txtRecord && txtRecord.includes(":")) {
            const [ip, port] = txtRecord.split(":");
            const nodeName = `${SUBNAME}-${host}`;
            const vless = `vless://${uuid}@${ip}:${port}?encryption=none&security=none&type=tcp#${encodeURIComponent(nodeName)}`;
            vlessLinks.push(vless);
          }
        }

        if (vlessLinks.length === 0) throw new Error("解析失败，请检查 TXT 记录");

        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1; // 月份从0开始，所以+1
        const day = now.getDate();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const second = now.getSeconds();

        // 乘积计算
        const uploadVal = year * month * day * hour * (minute + 1) * (second + 1) * 10; // 防止出现 0
        const downloadVal = uploadVal * 100;
        
        // 转换为字节 (为了让客户端显示正常，单位通常是字节，我们将其放大以便在客户端显示为 GB/MB)
        // 比如将乘积结果视为 MB，乘以 1024*1024 转换为字节
        const uploadBytes = uploadVal;
        const downloadBytes = downloadVal;
        const totalBytes = 536870912000; // 总流量设为1tb
        
        // 过期时间：设为 2099 年
        const expireTime = 4102444799;

        const userInfoHeader = `upload=${uploadBytes}; download=${downloadBytes}; total=${totalBytes}; expire=${expireTime}`;
        
        const fileName = `${SUBNAME}`;
        
        const resHeaders = {
          "content-type": "text/plain;charset=utf-8",
          "Subscription-Userinfo": userInfoHeader,
          "Profile-Update-Interval": "24",
          "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`
        };

        if (type === "v2ray") {
          return new Response(btoa(unescape(encodeURIComponent(vlessLinks.join("\n")))), { headers: resHeaders });
        }

        if (type === "clash") {
          const v2raySubUrl = new URL(request.url);
          v2raySubUrl.searchParams.set("type", "v2ray");
          
          const targetUrl = `https://${SUBAPI}/sub?target=clash&url=${encodeURIComponent(v2raySubUrl.toString())}&config=${encodeURIComponent(SUBCONFIG)}&emoji=true`;
          const subRes = await fetch(targetUrl);
          const subContent = await subRes.text();
          return new Response(subContent, { headers: resHeaders });
        }
      } catch (e) {
        return new Response("Worker 错误: " + e.message, { status: 500 });
      }
    }
    return new Response("404 Not Found", { status: 404 });
  }
};

const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
  <title>订阅生成器</title>
</head>
<body class="bg-slate-900 flex items-center justify-center min-h-screen p-4">
  <div class="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md text-white text-center">
    <h2 class="text-2xl font-bold mb-6 text-blue-400">STUN_Vless2sub Subscription</h2>
    
    <div class="text-left mb-4">
      <label class="block text-sm font-medium text-slate-300 mb-1">UUID</label>
      <input id="uuid" class="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="请输入你的 UUID">
    </div>

    <div class="text-left mb-6">
      <label class="block text-sm font-medium text-slate-300 mb-1">TXT 动态域名</label>
      <textarea id="host" rows="3" class="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="domain1.com, domain2.com"></textarea>
    </div>

    <div class="flex gap-3 mb-4">
      <button onclick="generateSub('v2ray')" class="flex-1 bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-bold transition">V2Ray 订阅</button>
      <button onclick="generateSub('clash')" class="flex-1 bg-emerald-600 hover:bg-emerald-500 py-3 rounded-lg font-bold transition">Clash 订阅</button>
    </div>

    <div id="resultBox" class="hidden flex-col items-center bg-slate-900/50 p-4 rounded-xl mt-6">
      <textarea id="subUrl" readonly class="w-full p-2 mb-3 bg-slate-800 text-sm text-gray-300 border border-slate-600 rounded-lg resize-none" rows="2"></textarea>
      <button onclick="copySub()" class="w-full bg-slate-600 hover:bg-slate-500 py-2 rounded-lg font-bold mb-4 transition">复制订阅链接</button>
      <div id="qrcode" class="p-2 bg-white rounded-lg"></div>
    </div>

    <div class="mt-8 pt-4 border-t border-slate-700 text-slate-500 text-xs">
      Based on <a href="https://github.com/zhuqq2020/STUN_Vless2sub" target="_blank" class="hover:text-blue-400 underline">zhuqq029/STUN_Vless2sub</a>
    </div>
  </div>
  <script>
    function generateSub(t) {
      const u = document.getElementById('uuid').value.trim();
      const h = document.getElementById('host').value.trim();
      if(!u || !h) { alert('请填写 UUID 和至少一个 TXT 域名'); return; }
      const url = window.location.origin + "/sub?uuid=" + encodeURIComponent(u) + "&host=" + encodeURIComponent(h) + "&type=" + t;
      document.getElementById('resultBox').classList.remove('hidden');
      document.getElementById('resultBox').classList.add('flex');
      document.getElementById('subUrl').value = url;
      document.getElementById('qrcode').innerHTML = "";
      new QRCode(document.getElementById('qrcode'), {text: url, width: 180, height: 180});
    }
    function copySub() {
      const copyText = document.getElementById("subUrl");
      copyText.select();
      document.execCommand("copy");
      alert("已复制到剪贴板");
    }
  </script>
</body>
</html>
`;
