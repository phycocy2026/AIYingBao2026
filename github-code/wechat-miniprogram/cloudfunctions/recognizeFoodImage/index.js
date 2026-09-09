const cloud = require("wx-server-sdk");
const https = require("https");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const API_KEY = process.env.DASHSCOPE_API_KEY || process.env.AIYINGBAO_VISION_API_KEY;
const API_URL = process.env.AIYINGBAO_VISION_API_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
const MODEL = process.env.AIYINGBAO_VISION_MODEL || "qwen-vl-plus";

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

exports.main = async (event) => {
  if (!API_KEY) {
    throw new Error("未配置 DASHSCOPE_API_KEY");
  }
  if (!event.imageBase64) {
    throw new Error("缺少图片数据");
  }

  const labels = Array.isArray(event.labels) ? event.labels : [];
  const labelText = labels.map((item) => `${item.key}:${item.name}`).join("、");
  const imageDataUrl = event.imageBase64.startsWith("data:")
    ? event.imageBase64
    : `data:image/jpeg;base64,${event.imageBase64}`;

  const response = await postJson(API_URL, {
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
          { type: "image_url", image_url: { url: imageDataUrl } }
        ]
      }
    ]
  });

  return parseModelContent(response.choices[0].message.content);
};
