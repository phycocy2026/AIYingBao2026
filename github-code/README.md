# AI智营宝 V3.2.4 完整界面修正版

本包同时包含可发布到 GitHub Pages 的完整前端，以及可部署到 Render 的 Node.js 视觉识别接口。

## GitHub Pages

将本目录中的 `index.html`、`app.js`、`styles.css` 和 `top5_translate.js` 上传到仓库根目录。在 GitHub 的 **Settings → Pages** 中选择 `main` 与 `/ (root)`。`index.html` 已确保先加载 `top5_translate.js`，再加载 `app.js`。

前端默认调用：

`https://aiyingbao2026.onrender.com/api/vision-recognition`

如需更换接口，可在 `app.js` 之前设置 `window.AIYINGBAO_API_URL`，或在浏览器控制台执行：

`localStorage.setItem('aiyingbaoApiUrl', 'https://你的域名/api/vision-recognition')`

## Render 后端

把 `package.json` 和 `vision-proxy-server.js` 放在 Render 服务的 Root Directory 中。

- Build Command：`npm install`
- Start Command：`npm start`
- Environment Variable：`DASHSCOPE_API_KEY=你的阿里云百炼API密钥`
- Health Check Path：`/health`

服务调用 `qwen3-vl-plus`，接口为 `POST /api/vision-recognition`。API 密钥只保存在 Render 环境变量中，切勿写入前端或提交到 GitHub。

如果页面提示 `Failed to fetch`，请先访问 `https://aiyingbao2026.onrender.com/health` 唤醒 Render 服务；若无法看到健康检查 JSON，请在 Render 重新部署本包中的 `vision-proxy-server.js` 并确认环境变量已设置。前端使用兼容旧服务的简单跨域请求，不依赖 `OPTIONS` 预检。

## 识别输出

页面与后端均限制为粗粒度类别，例如：牛肉类主食、面食类、米饭类餐食、鱼虾类、蔬菜类、水果类、混合餐食。后端会返回中文食材、营养估算、可信度和 Top-5；前端还会对常见英文标签进行中文兜底映射。营养结果仅供健康管理参考，不替代专业医疗意见。
