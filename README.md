# Zuodong Zhong · 钟祚栋

My personal academic website, featuring my research, publications, and academic background.

个人学术主页，介绍我的研究方向、论文项目与学习经历，支持中英文切换。

🌐 [zuodong-zhong.github.io](https://zuodong-zhong.github.io/)

## 访问统计

首页通过 Cloudflare Web Analytics 统计访问。在 Cloudflare 控制台中为 `zuodong-zhong.github.io` 创建 Web Analytics 站点，将提供的 beacon 代码中的 32 位十六进制 `token` 填入 `index.html` 的配置：

```html
<meta name="cloudflare-web-analytics-token" content="你的32位站点token">
```

此处使用公开的站点统计 token，不是 Cloudflare API token。配置为空或格式无效时不加载统计；统计只在 `https://zuodong-zhong.github.io` 上启用，本地预览不计入。访问量从配置生效后开始记录，不能补回之前的历史数据。

## 排除自己的访问

在 Mac 和 iPhone 各自使用的浏览器中打开[访问统计设置页](https://zuodong-zhong.github.io/analytics.html)，点击“排除此浏览器的访问”，确认保存成功后通过页面链接返回首页。设置页本身不加载统计。

排除状态保存在该浏览器的网站存储中。每个浏览器和 Profile 都要分别设置；应用内浏览器也需要单独设置。清除网站数据、退出无痕浏览或换新浏览器后，需要重新设置。Safari 可能清理网站存储，因此不能保证永久排除。

建议收藏并始终使用[排除统计的首页链接](https://zuodong-zhong.github.io/?analytics=off)。`?analytics=off` 会先尝试保存排除设置，且本次访问必定不加载统计，即使浏览器存储不可用或被清空也有效；该参数会保留，便于收藏。其他 `analytics` 参数值不会解除排除。读取浏览器存储发生错误时，首页也会跳过统计。

开启排除后，关闭此前已打开的首页标签再重新打开；该设置不能删除已记录的访问。恢复时，在设置页点击“恢复统计”，确认成功后使用[普通首页链接](https://zuodong-zhong.github.io/)重新打开，并修改旧书签；带 `?analytics=off` 的书签会再次开启排除。
