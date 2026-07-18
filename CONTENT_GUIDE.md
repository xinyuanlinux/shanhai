# 内容维护说明

山海是纯静态 GitHub Pages 网站，内容无需后端即可继续增加。

## 新增一篇文章

1. 在 `assets/content.js` 的 `articles` 数组顶部加入一条文章数据：
   - `slug`：唯一英文短名
   - `path`：文章 HTML 文件名
   - `date`、`category`、`title`、`excerpt`、`minutes`
2. 复制 `posts/now.html`，改名为新文章文件。
3. 修改页面的标题、描述、canonical、正文和 `data-article-nav` 值。
4. 提交后，文章目录会自动从 `assets/content.js` 读取并展示；详情页的上一篇/下一篇也会自动更新。

## 更新主页

- 主页结构在 `index.html`。
- 公共视觉与响应式规则在 `assets/styles.css`。
- 交互逻辑在 `assets/site.js`。
- 影像使用可公开引用的图片时，请添加 `alt` 描述并保留来源署名。
- 新增动画必须兼容 `prefers-reduced-motion`。

## 发布

推送到 `main` 后，由 GitHub Pages 自动发布。