# Zuodong Zhong · 钟祚栋

My personal academic website, featuring my research, publications, and academic background.

个人学术主页，介绍我的研究方向、论文项目与学习经历，支持中英文切换。

🌐 [zuodong-zhong.github.io](https://zuodong-zhong.github.io/)

## 博客

博客列表位于 `blog/index.html`。个人主页、博客列表和文章页共用同一个顶部导航，布局参考 [Haoyi Zhu](https://www.haoyizhu.site/)：左侧姓名回到主页，中间是 `About / News / Publications / Experience / Blog`（简介 / 动态 / 论文 / 经历 / 博客），右侧是 `EN | 中` 语言切换。在主页上，链接跳到对应章节并随滚动高亮当前章节；在博客页上，章节链接回到主页对应位置，`Blog` 保持高亮。桌面端页眉为吸顶的浅色毛玻璃，手机上链接排成可横滑的第二行，并随页面滚走，给正文留出空间。页眉样式在 `site-header.css`。全站共用的字体、颜色和 1040px 内容宽度集中在 `site-theme.css`，每个页面都要先加载它，再加载自己的样式。页眉、博客列表（`blog/blog.css`）和文章页使用无衬线字体；主页（`styles.css`）保留学术主页的衬线字体、蓝色章节标题与标题下的细线，并共用同一链接蓝色和内容宽度。文章页保留各自的阅读色调。页眉 HTML 直接写在 `index.html`、`blog/index.html` 和 `content/*.html` 中，导航不依赖 JavaScript。修改页眉结构时需同步这些源文件，再运行 `npm run build:blog`。

博客布局参考 [Axi's Blog](https://axi404.top/blog/research)，主页保持统一的浅灰白色调；文章使用横向封面卡片，标题与简介叠在轻度虚化、渐隐的图片上。卡片高度随文字自然增长，手机上会加强遮罩以保证可读性。列表本身不需要安装依赖或构建，可直接部署到 GitHub Pages。

目前有六篇可在本站完整阅读的学习笔记，分为量子计算与扩散模型两个系列。量子计算系列根据作者提供的手写笔记与整理稿编辑，日期为本站整理发布日期；扩散模型系列的日期为知乎原文显示的最后编辑日期，不是首次发布日期。

| 文章 | 正文源文件 | 生成页面 | 文章色调 |
| --- | --- | --- | --- |
| 量子计算入门 | `content/quantum-computing-basics.html` | `blog/quantum-computing-basics/index.html` | 雾蓝 |
| 量子神经网络 | `content/quantum-neural-networks.html` | `blog/quantum-neural-networks/index.html` | 灰紫 |
| Grover 搜索 | `content/grover-search.html` | `blog/grover-search/index.html` | 苔绿 |
| Score-based Generative Models | `content/score-based-generative-models.html` | `blog/score-based-generative-models/index.html` | 暖灰与金棕 |
| DDPM：从逐步去噪到一步加噪 | `content/ddpm.html` | `blog/ddpm/index.html` | 冷蓝灰 |
| DDIM：相同前向分布与跳步采样 | `content/ddim.html` | `blog/ddim/index.html` | 灰绿与墨绿 |

文章采用与各自封面相配的渐变背景、封面柔光、右侧目录、阅读进度、移动端折叠目录和可横向滚动的公式排版。文章页使用独立的 `blog/article.css`，不继承首页样式。每篇正文在源文件的 `:root` 样式中设置自己的 `--article-wash-start`、`--article-wash-middle`、`--article-wash-end`、`--article-surface`、`--article-accent` 和 `--article-cover-image`。链接、校注、引用、算法与目录强调色均从 `--article-accent` 自动派生；需要微调时可覆盖 `--article-accent-strong`、`--article-accent-muted`、`--article-accent-line`、`--article-accent-rule`、`--article-accent-soft`、`--article-accent-soft-hover` 和 `--article-selection`。封面变量使用以 `/blog/` 开头的站点根相对路径。

### 编辑文章与公式

正文源文件放在 `content/` 目录中，文件名决定文章路径：`content/<slug>.html` 对应 `blog/<slug>/index.html`。行内公式写在 `<span data-math>…</span>` 内，独立公式写在 `<div data-math="block">…</div>` 内，内容为 LaTeX；HTML 中的 `&`、`<`、`>` 需要分别写为 `&amp;`、`&lt;`、`&gt;`。修改后运行：

```sh
npm ci
npm run build:blog
```

构建脚本 `scripts/build-blog.cjs` 按文件名顺序批量读取 `content/*.html`，将所有公式预渲染为 KaTeX HTML + MathML，再写入各自的文章目录；任一文章的公式解析失败时不会写入本批文章页面。共享的样式、字体和许可证只复制一次到 `assets/vendor/katex/`。将生成后的 HTML 与这些资源一并提交即可，GitHub Pages 无需执行构建；读者关闭 JavaScript、无法访问 CDN 时仍可阅读公式。不要直接修改生成的文章 HTML。文章正文保留中文，不随列表的界面语言切换。

原文中的公式、算法和参考推导截图已转为文字与公式排版，出处和符号修正保留在正文的参考文献及校注中。Score 文章保留原文的 `score-field.jpg` 梯度场示意；新整理的 DDPM、DDIM 两篇中，仅 DDPM 的 `blog/ddpm/forward-process.jpg` 保留自知乎原文，其余公式与推导不依赖截图。

三篇艺术封面均由内置 imagegen 生成，不表示真实实验结果。Score 文章使用 `blog/score-based-generative-models/diffusion-cover.jpg`，DDPM、DDIM 分别使用 `blog/ddpm/cover.jpg`、`blog/ddim/cover.jpg`；每个目录保留对应 `.png` 原图与 `cover-prompt.txt` 完整提示词及生成来源。原文、参考推导和图片来源记录见 `THIRD_PARTY_NOTICES.txt`，KaTeX 的 MIT 许可见 `assets/vendor/katex/LICENSE`。

新增文章时：

1. 新建 `content/<slug>.html`，设置标题、正文、配色与封面，将文章素材放在 `blog/<slug>/`，然后执行批量构建。在 `blog/index.html` 的 `.post-list` 内复制一个 `<article data-post>`，按专栏系列顺序或日期安排（当前扩散模型系列按学习 01 → 02 → 03 排列）；填写标题、摘要、链接和准确日期，并替换 `.post-art img` 的封面路径。链接既可以指向知乎，也可以指向本站的文章文件，例如 `./my-new-post/`（对应 `blog/my-new-post/index.html`）。
2. 填写 `data-collection`、空格分隔的 `data-tags`，以及中英文搜索关键词 `data-search`。新增专栏或标签时，在筛选按钮中添加对应的 `data-filter`。搜索与专栏/标签筛选可组合使用。
3. 英文文案放在元素正文，中文放在同一元素的 `data-zh` 中；`data-zh` 只用于纯文本元素。中文文章标题也可以直接保留中文并设置 `lang="zh-CN"`。新增独立文章页时可复用 `site.js`，并给 `<title>` 设置 `data-zh` 以支持双语标题。
4. 同步文章计数的静态默认值，保证关闭 JavaScript 时仍显示正确的数量。脚本启用后会自动计算数量；正文列表和文章链接在不启用 JavaScript 时也能正常访问。
5. `index.html` 的 Blogs（博客）区块保留精选文章，不自动同步完整博客列表；本次量子计算系列只加入博客页，首页原有三项保持不变。为兼容原有链接和样式，区块仍保留 `writing` 锚点与 `.writing-list` 类名。只有需要在首页展示文章时才添加项目；已有精选文章的缩略图为封面的 360px 副本 `blog/<slug>/thumb.jpg`。

### 量子计算交互演示

`blog/quantum/` 保存三张原创 SVG 封面、两张根据手写笔记重画的电路图，以及不依赖第三方运行时的交互样式和脚本。五个演示分别为：布洛赫球与单比特门、相位干涉、Bell 态与经典混合态的联合测量、单 qubit QNN 的参数位移训练、Grover 分步振幅放大。数值为理想模型的教学计算；采样按钮表示独立重复制备和测量，不模拟硬件噪声。

数学计算集中在 `quantum-math.js`，界面在 `demos.js` / `demos.css`。QNN 的九个软目标由文中公开的正弦公式生成；训练通过当前输出的参数位移梯度和损失链式法则更新参数。关闭 JavaScript 时，正文、预渲染公式、电路图与默认示例仍可阅读，交互控件禁用。`npm test` 包含酉门、相位不变性、联合测量、梯度、训练收敛与 Grover 成功概率的数值检查。

本地预览：在仓库根目录运行 `python3 -m http.server 8000 --bind 127.0.0.1`，打开 `http://127.0.0.1:8000/blog/`。页面复用首页的语言偏好与访问统计排除设置。

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
