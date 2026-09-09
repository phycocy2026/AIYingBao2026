# AI智营宝智能健康与营养管理助手

本仓库包含三个版本：

- `web/`：普通网页版，支持图片上传并通过后端代理调用视觉大模型。
- `windows-pc/`：Windows PC 桌面版，基于 Python Tkinter，支持图片上传和视觉大模型识别。
- `wechat-miniprogram/`：微信小程序版，支持拍照/选图并通过云函数调用视觉大模型。

## 普通网页版

进入 `web` 目录后运行：

```powershell
$env:DASHSCOPE_API_KEY="你的API Key"
node vision-proxy-server.js
```

浏览器打开：

```text
http://localhost:8787
```

## Windows PC 版

进入 `windows-pc` 目录后运行：

```powershell
$env:DASHSCOPE_API_KEY="你的API Key"
python AIYingBao_PC.py
```

也可以双击 `run_AIYingBao_PC.bat` 启动基础版本。

## 微信小程序版

1. 使用微信开发者工具打开 `wechat-miniprogram`。
2. 开通云开发。
3. 部署云函数 `cloudfunctions/recognizeFoodImage`。
4. 在云函数环境变量中配置：

```text
DASHSCOPE_API_KEY=你的API Key
```

## 大模型配置

默认使用阿里云百炼 DashScope 的 OpenAI 兼容接口：

```text
模型：qwen-vl-plus
接口：https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
```

可选环境变量：

```text
AIYINGBAO_VISION_MODEL
AIYINGBAO_VISION_API_URL
AIYINGBAO_VISION_API_KEY
```

不要把 API Key 写入前端代码或提交到 GitHub。
