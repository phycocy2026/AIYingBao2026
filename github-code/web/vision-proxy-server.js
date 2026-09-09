const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");

const PORT = Number(process.env.PORT || 8787);
const API_KEY = process.env.DASHSCOPE_API_KEY || process.env.AIYINGBAO_VISION_API_KEY;
const API_URL = process.env.AIYINGBAO_VISION_API_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
const MODEL = process.env.AIYINGBAO_VISION_MODEL || "qwen-vl-plus";

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 15 * 1024 * 1024) {
        req.destroy(new Error("请求体过大"));
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function postJson(url, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const target = new URL(url);
    const req = https.request(
      target,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body)
        },
        timeout: 45000
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => {
          raw += chunk;
        });
        res.on("end", () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error(`大模型接口返回 HTTP ${res.statusCode}: ${raw.slice(0, 200)}`));
            return;
          }
          resolve(JSON.parse(raw));
        });
      }
    );
    req.on("timeout", () => req.destroy(new Error("大模型接口超时")));
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function parseModelContent(content) {
  const text = Array.isArray(content)
    ? content.map((item) => item.text || "").join("")
    : String(content || "");
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (error) {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw error;
    return JSON.parse(match[0]);
  }
}

async function recognizeImage(payload) {
  if (!API_KEY) {
    throw new Error("未配置 DASHSCOPE_API_KEY");
  }
  const labels = Array.isArray(payload.labels) ? payload.labels : [];
  const labelText = labels.map((item) => `${item.key}:${item.name}`).join("、");
  const result = await postJson(API_URL, {
    model: MODEL,
    temperature: 0.1,
    max_tokens: 300,
    messages: [
      {
        role: "system",
        content: "你是用于健康与营养管理软件的图像识别助手，只识别食物、饮品和餐食类型。"
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `请识别图片中的主要餐食或饮品，并从以下分类中选择最接近的一项：${labelText}。只返回 JSON：{"foodKey":"分类key","label":"分类名","dishName":"具体食物","confidence":0.0}`
          },
          { type: "image_url", image_url: { url: payload.imageDataUrl } }
        ]
      }
    ]
  });
  return parseModelContent(result.choices[0].message.content);
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(JSON.stringify(data));
}

function serveStatic(req, res) {
  const pathname = decodeURIComponent(new URL(req.url, `http://localhost:${PORT}`).pathname);
  const filePath = path.join(__dirname, pathname === "/" ? "index.html" : pathname);
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = ext === ".html" ? "text/html" : ext === ".css" ? "text/css" : ext === ".js" ? "application/javascript" : "application/octet-stream";
    res.writeHead(200, { "Content-Type": `${type}; charset=utf-8` });
    res.end(data);
  });
}

http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }
  if (req.method === "POST" && req.url === "/api/vision-recognition") {
    try {
      const payload = JSON.parse(await readBody(req));
      const result = await recognizeImage(payload);
      sendJson(res, 200, result);
    } catch (error) {
      sendJson(res, 500, { error: error.message });
    }
    return;
  }
  serveStatic(req, res);
}).listen(PORT, () => {
  console.log(`AI智营宝网页版已启动：http://localhost:${PORT}`);
});
