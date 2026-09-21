# AI智营宝 V3.2.5 手机端修正版

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

V3.2.5 会在手机端自动把照片缩放到最长边 1600 像素并转成 JPEG，再唤醒 Render 服务后上传，避免 iPhone 原始照片经 Base64 编码后过大导致 Safari 报 `Load failed`。若仍提示网络连接中断，请关闭 VPN/内容拦截，或切换 Wi-Fi 与蜂窝网络后重试。

## 识别输出

页面与后端均限制为粗粒度类别，例如：牛肉类主食、面食类、米饭类餐食、鱼虾类、蔬菜类、水果类、混合餐食。后端会返回中文食材、营养估算、可信度和 Top-5；前端还会对常见英文标签进行中文兜底映射。营养结果仅供健康管理参考，不替代专业医疗意见。
