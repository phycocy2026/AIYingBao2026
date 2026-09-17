const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");

const PORT = Number(process.env.PORT || 8787);
const API_KEY = process.env.DASHSCOPE_API_KEY || process.env.AIYINGBAO_VISION_API_KEY;
const API_URL = process.env.AIYINGBAO_VISION_API_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
const MODEL = process.env.AIYINGBAO_VISION_MODEL || "qwen3-vl-plus";

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
    max_tokens: 500,
    messages: [
      {
        role: "system",
        content: "你是用于健康与营养管理软件的食材识别助手。请识别图片中实际可见的食材，不要编造具体菜名；无法确定的食材要使用宽泛名称。"
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `请逐项识别图片中可见的食材，并从以下营养分类中选择最接近的一项用于内部计算：${labelText}。不要返回“鸡胸藜麦碗”“糙米鸡腿饭”之类推测出的菜名。只返回 JSON，不要附加解释：{"foodKey":"分类key","ingredients":["食材1","食材2"],"nutrition":{"calories":0,"protein":0,"carbs":0,"fat":0},"confidence":0.0}。nutrition 为整份餐食的估算值，单位依次为 kcal 和 g。只列出图片中有视觉依据的食材；看不清时写“未知食材”。`
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
      console.error("视觉识别失败：", error.message);
      sendJson(res, 500, { error: error.message });
    }
    return;
  }
  serveStatic(req, res);
}).listen(PORT, () => {
  console.log(`AI智营宝网页版已启动：http://localhost:${PORT}`);
});
