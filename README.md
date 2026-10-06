# 钟祚栋 · 个人学术主页

北京大学博士研究生钟祚栋的个人主页。英文为默认语言，支持中文切换。排版严格对照 [Cheng Lu 的个人主页](https://luchengthu.github.io/)及其实际样式表：灰色背景、白色单栏页面、顶部左文右图、Georgia 正文、蓝色标题和方形列表。

## 本地预览

在项目目录运行：

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

打开 http://127.0.0.1:8765 。页面为纯静态网页，无需安装依赖或构建，也可以直接打开 `index.html`。

## 更新内容

- `index.html`：个人简介、News、合并的论文与项目列表、科研经历、教育经历、荣誉和联系方式。
- 每段英文对应元素的 `data-zh` 属性是中文译文；新增内容时同步更新两种语言。
- `styles.css`：与参考页一致的页面尺寸、字体、颜色、标题和列表间距。保留参考页的固定文档式布局，没有额外的手机重排。
- 顶部信息分为姓名、身份与学校、联系方式三组；邮箱与社交链接分行，链接间距统一且可自然换行。顶部增加 24px 留白，左侧三组信息在头像高度内分布，姓名与照片顶部靠齐、联系方式靠近照片底部；头像尺寸和右对齐位置保持不变。
- `site.js`：语言切换、本机语言偏好保存及论文配图查看器。禁用 JavaScript 时仍可阅读完整英文内容，并通过配图链接打开原文件。
- `assets/images/头像.jpg`：浏览器标签页的网页图标（favicon），与首页人物照片分别维护；替换时同步更新图标链接的内容哈希版本参数，避免旧图标缓存。
- `assets/images/国家奖学金答辩.jpg`：用户指定的头像原图。页面以 200px 宽、3:4 竖版取景呈现头部与上半身，保留蓝色文件夹；使用 14px 圆角和轻微阴影。照片与正文右边缘对齐，人物取景略向右移，下方显示“Simple and Effective”及科研理念说明。裁切由 `styles.css` 中的 `.portrait-frame` 与 `.portrait` 控制，原图文件不变。
- `assets/images/微信二维码.jpg`：用户提供的微信联系方式。点击顶部 `[WeChat]` / `[微信]` 展开二维码，可点击原图放大；支持关闭按钮、Esc 和点击外部关闭。
- `assets/images/omnidoc_228.png`：用户指定的 FireRed-OCR 性能对比图，点击进入站内大图查看器。
- `assets/images/reasonplan.pdf`：用户指定的 ReasonPlan 框架图原件；`reasonplan-figure.png` 是按 PDF 原始裁剪范围导出的清晰网页预览，点击进入站内大图查看器，界面中保留原始 PDF 链接。
- `assets/images/PKU.png`、`assets/images/USTB.png`：项目内已有的两所学校校徽，展示在对应教育经历左侧，点击可访问学校官网。
- `assets/images/RedNote.png`、`assets/images/CASIA.png`：项目内已有的小红书与自动化所 logo，展示在对应科研经历左侧。

FireRed-OCR 与 ReasonPlan 均使用左图右文排列，配图列宽 260px、图文间隔 24px；图片保留完整内容与原始比例，使用圆角、浅色边框和少量留白。点击配图在当前页面打开大图查看器，支持二倍放大、滚动查看、打开原文件、关闭按钮、Esc 和点击遮罩关闭，关闭后恢复页面位置与键盘焦点。论文标题、作者分别成行，ReasonPlan 的 `CoRL 2025` 排在资源链接行末。科研经历和教育经历统一使用 80×80px logo、22px 图文间距，右侧依次为机构名称、时间与简述，logo 与整组文字垂直居中。页面其余尺寸、字体、颜色和章节标题样式保留参考页设置。更新 ReasonPlan 配图预览时可运行：

```sh
pdftoppm -f 1 -singlefile -cropbox -scale-to 2400 -png assets/images/reasonplan.pdf assets/images/reasonplan-figure
```

新论文可复制 `#publications` 标题之后列表中的 `li`，按“标题、作者、链接与会议、简短介绍”的顺序修改；项目在同一列表中注明贡献角色。新的教育、科研经历或奖项可以按相邻条目的格式添加。联系方式已使用北大学生邮箱，并加入 GitHub、Google Scholar、知乎、小红书、X 和微信二维码。没有提供的北大院系和简历下载链接暂未添加。

简介按用户指定保留五段：博士身份与导师，以及合并在首段的本科背景简述；当前研究兴趣及合作指导；小红书实习与 FireRed-OCR 贡献；自动化所实习、ReasonPlan 与导师；费曼学习法及知乎笔记。本科起止日期和社团职务在 Education 中列出，完整实习时间在 Research Experience 中列出。荣誉栏目完整保留七项奖项，放在教育经历之后，让研究成果与经历先呈现。

News 位于简介与论文列表之间，仅保留 🚀 FireRed-OCR 开源和 🎉 ReasonPlan 接收两条研究动态；今后用于论文、项目发布与重要近况，奖项统一维护在 Honors & Awards。复制 `.news-list` 中的条目即可添加新消息，中英文和 `time` 日期一起更新。ReasonPlan 的接收月份采用用户补充的 2025.08，写出 Conference on Robot Learning 全称。FireRed-OCR 的 News 简述开源及发布时的端到端方案 SOTA，具体分数与核心贡献者身份在项目条目中保留；发布时 OmniDocBench v1.5 的 92.94 分已由[官方榜单](https://github.com/FireRedTeam/FireRed-OCR#-benchmark)与[技术报告](https://arxiv.org/abs/2603.01840)核对，不泛化为所有方案或当前排名。

## GitHub Pages

本项目使用 GitHub Pages：仓库 Settings → Pages 中选择 Deploy from a branch，分支 `main`，目录 `/ (root)`。更新提交并推送到 `main` 后自动发布，线上地址为 https://zuodong-zhong.github.io/ 。

`index.html` 中的 CSS 和 JavaScript 引用带有内容哈希版本参数，避免新页面加载浏览器缓存的旧样式或脚本。每次修改 `styles.css` 或 `site.js`，将对应引用的 `?v=` 更新为该文件 SHA-256 的前 12 位（用 `shasum -a 256 styles.css site.js` 查看），并与页面一起提交。发布后核对页面实际引用的版本化资源，而不仅是无参数的文件地址。

## 内容依据

- 用户提供的《北京科技大学_钟祚栋_简历+科研材料.pdf》。原文件包含完整申请材料，未将原始 PDF 复制到主页；公开介绍和原始论文配图从中整理，当前头像采用用户后来指定的照片。
- 用户补充：北京大学博士研究生，2026.09–至今（英文 Present）；简介使用用户指定的简洁表述，入学时间在教育经历中保留。博士介绍中补充受到[黄益星助理教授（Asst. Prof. Yixing Huang）](https://imt.bjmu.edu.cn/szll/yjsds/yxyxjs_2/65ee71d8a924471d8e44ddec9a3ecbc6.htm)指导；姓名与职称由北大官方教师主页核对，院系待补充。
- 用户补充当前研究兴趣为长视频理解的高效架构，聚焦稀疏注意力机制，以提升多模态大模型处理长视频的效率与效果；受到[郭龙腾副教授（Assoc. Prof.）](https://people.ucas.ac.cn/~ltguo)和[刘静教授（Prof.）](https://ia.cas.cn/rcdw/yxqnjj/202404/t20240422_7129861.html)指导，职称采用用户明确提供的表述。当前兴趣与网页简介元数据同步更新，既往自动驾驶科研经历保留。
- ReasonPlan 的作者顺序和发表信息采用 [PMLR 正式论文集](https://proceedings.mlr.press/v305/liu25e.html)，与早期材料中的作者顺序存在差异。
- PlanCoT 在原材料中处于投稿状态，未将其列为已发表论文；更新状态后可继续补充。
- 用户确认于 2025.11–2026.04 在[小红书超级智能团队](https://fireredteam.github.io/)担任科研实习生，是 FireRed-OCR 的核心贡献者，并提供[项目介绍](https://mp.weixin.qq.com/s/UTJ1qNW9GLM8N4y09Q-Vhw)正文。技术概述、2026 年和 OmniDocBench v1.5 的 92.94 分由[官方仓库](https://github.com/FireRedTeam/FireRed-OCR)核实；技术报告使用官方仓库链接的 [arXiv 版本](https://arxiv.org/abs/2603.01840)，模型使用用户指定的 [Hugging Face 链接](https://huggingface.co/FireRedTeam/FireRed-OCR)，演示保留 ModelScope 链接。条目注明项目贡献角色，不推测个人具体职责；项目简介与 News 均注明发布时达到端到端方案 SOTA，不将发布时的榜单排名表述为持续有效的当前排名。
- 用户补充在北京科技大学期间受到[李擎教授](https://saee.ustb.edu.cn/szdw/xsjs2/kzkxygcx/346c13ee30504a0cb64c4bc213693ee2.htm)指导；按要求移除独立的深度伪造检测科研经历。
- 用户确认已取得自动化专业工学学士学位，简介和教育经历写作“B.Eng. in Automation”（Bachelor of Engineering in Automation）；中文教育经历使用“自动化专业工学学士，自动化学院（2022.08–2026.06）”，避免相邻翻译片段出现重复逗号。正式博士导师用“advised by”表述，合作指导用“I am fortunate to receive research guidance from …”，不表述为联合导师。
- 北京科技大学教育经历在导师信息上方注明“期间曾担任索奥科技中心社团主席”，名称链接到用户提供的[社团介绍](https://oldsaee.ustb.edu.cn/xueshenggongzuo/tuanxuezuzhi/suoaokejizhongxin/)。学院名称链接到[学院官网](https://saee.ustb.edu.cn/)，中文版学院名称使用“自动化学院”。
- 页脚左侧保留版权说明，右侧右对齐显示对[路橙学长](https://luchengthu.github.io/)的模板支持致谢。
- 用户澄清自动化所经历：2024.07–2025.08 在[中国科学院自动化研究所](http://www.ia.cas.cn/)担任科研实习生，受到[张启超副教授（Assoc. Prof.）](https://people.ucas.ac.cn/~0044631)和[赵冬斌教授（Prof.）](https://people.ucas.ac.cn/~zhaodongbin)指导，按最新要求不再额外注明“直接指导”。前半年（2024.07–2025.01）研究扩散模型及其在自动驾驶中的应用，随后（2025.01–2025.08）转向 VLM 自动驾驶与 ReasonPlan。科研经历保留简短项目概述，并单独列出两位导师及主页链接；费曼学习法与博客说明独立放在简介中。教育经历同样单列对应导师及链接。
- 用户补充喜欢费曼学习法，曾将自己对扩散模型的理解整理成博客，分享到[知乎专栏](https://www.zhihu.com/column/c_2090888965956151131)；说明和链接单独放在个人简介的学习笔记段落中。
- 用户补充 2026 年 6 月获北京市普通高等学校优秀毕业生，移除 ICM H 奖。
- 奖项按时间倒序排列，日期和正文使用独立列，使各条奖项及换行文字左端一致。年月以用户补充为准：北京市普通高等学校优秀毕业生 2026.06、宝钢优秀学生奖 2025.12、刘芹科技之星 2025.04、国家奖学金 2024.12、睿抗 2024.08、中国大学生计算机设计大赛 2024.07、永钢奖学金 2023.11。宝钢优秀学生奖保留[学校推送](https://mp.weixin.qq.com/s/BIi0fDSpUGNLGTRJJCXMlg)及每年获奖人数说明，国家奖学金保留[学校推送](https://mp.weixin.qq.com/s/lMo94nm98TUhxr787QqMxA)，按最新要求移除括号说明。[刘芹科技之星](https://mp.weixin.qq.com/s/mYVt4qszNtR1wRpTlXtp-w)及“感谢刘芹学长”的致谢由用户提供，中英文同步。
- 按用户补充，刘芹科技之星注明 Top 1%，永钢奖学金注明 Top 3%；刘芹学长的名字链接至用户指定的[百度百科条目](https://baike.baidu.com/item/%E5%88%98%E8%8A%B9/16503175)。比例依据用户提供的信息，不推测统计范围。
- 排版参数来自 [Cheng Lu 的个人主页](https://luchengthu.github.io/)和 [jemdoc.css](https://luchengthu.github.io/files/jemdoc.css)，独立实现本页所需规则。正文最大宽度 960px，外层左右各 50px，内容内边距各 16px；顶部左列占剩余宽度，右侧照片列固定 200px，与正文右边缘对齐；正文 Georgia 16px，段落行高 1.3，二级标题 20px。
