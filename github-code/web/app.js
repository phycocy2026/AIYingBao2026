const state = {
  goal: "balance",
  age: 29,
  sleep: 7,
  steps: 8200,
  glucose: "stable",
  restrictions: [],
  food: "bowl",
  recognitionIndex: 0
};

const VISION_PROXY_URL = window.AIYINGBAO_VISION_PROXY_URL || "/api/vision-recognition";

const foods = {
  bowl: {
    name: "鸡胸藜麦碗",
    macro: "520 kcal · 蛋白 42g · 脂肪 15g",
    carbs: 34,
    protein: 42,
    fat: 15
  },
  noodle: {
    name: "番茄牛肉面",
    macro: "690 kcal · 蛋白 31g · 碳水 92g",
    carbs: 92,
    protein: 31,
    fat: 21
  },
  salad: {
    name: "牛油果彩蔬沙拉",
    macro: "410 kcal · 蛋白 18g · 脂肪 24g",
    carbs: 28,
    protein: 18,
    fat: 24
  },
  rice: {
    name: "糙米鸡腿饭",
    macro: "630 kcal · 蛋白 36g · 碳水 76g",
    carbs: 76,
    protein: 36,
    fat: 18
  },
  beefRice: {
    name: "温泉蛋牛肉盖饭",
    macro: "760 kcal · 蛋白 42g · 碳水 72g",
    carbs: 72,
    protein: 42,
    fat: 32
  },
  beefNoodle: {
    name: "清汤牛肉面",
    macro: "720 kcal · 蛋白 36g · 碳水 88g",
    carbs: 88,
    protein: 36,
    fat: 24
  },
  porridge: {
    name: "南瓜燕麦粥",
    macro: "360 kcal · 蛋白 14g · 碳水 58g",
    carbs: 58,
    protein: 14,
    fat: 8
  },
  bao: {
    name: "全麦鸡蛋包",
    macro: "450 kcal · 蛋白 22g · 碳水 62g",
    carbs: 62,
    protein: 22,
    fat: 12
  },
  seafood: {
    name: "清蒸鱼虾蔬菜盘",
    macro: "480 kcal · 蛋白 45g · 脂肪 12g",
    carbs: 30,
    protein: 45,
    fat: 12
  },
  hotpot: {
    name: "番茄菌菇小火锅",
    macro: "780 kcal · 蛋白 38g · 脂肪 35g",
    carbs: 68,
    protein: 38,
    fat: 35
  },
  burger: {
    name: "牛肉芝士汉堡",
    macro: "850 kcal · 蛋白 34g · 脂肪 46g",
    carbs: 72,
    protein: 34,
    fat: 46
  },
  fruit: {
    name: "酸奶莓果杯",
    macro: "290 kcal · 蛋白 12g · 碳水 42g",
    carbs: 42,
    protein: 12,
    fat: 7
  },
  mungDrink: {
    name: "百合绿豆水",
    macro: "165 kcal · 糖 28g · 蛋白 2g",
    carbs: 34,
    protein: 2,
    fat: 0
  },
  coffee: {
    name: "Costa 杯装咖啡",
    macro: "180 kcal · 糖 18g · 脂肪 6g",
    carbs: 24,
    protein: 6,
    fat: 6
  }
};

const foodAliases = {
  beefNoodle: ["牛肉面", "拉面", "beef noodle", "ramen", "noodle", "noodles"],
  beefRice: ["牛肉盖饭", "牛肉饭", "牛排", "烤牛肉", "温泉蛋", "beef rice", "steak", "roast beef", "gyudon"],
  noodle: ["面食", "番茄牛肉面", "面", "粉", "pasta", "spaghetti"],
  salad: ["沙拉", "蔬菜", "牛油果", "salad", "vegetable", "avocado"],
  rice: ["米饭套餐", "米饭", "鸡腿饭", "便当", "rice", "bento"],
  porridge: ["粥", "燕麦", "南瓜", "porridge", "congee", "oatmeal"],
  bao: ["包子", "包点", "馒头", "饺子", "bao", "bun", "dumpling"],
  seafood: ["鱼", "虾", "海鲜", "fish", "shrimp", "seafood"],
  hotpot: ["火锅", "麻辣烫", "汤锅", "hotpot", "hot pot", "malatang"],
  burger: ["汉堡", "披萨", "薯条", "burger", "hamburger", "pizza", "fries"],
  fruit: ["水果", "酸奶", "苹果", "香蕉", "莓果", "fruit", "yogurt", "berry"],
  mungDrink: ["百合绿豆水", "绿豆水", "植物饮料", "瓶装饮料", "mung bean", "lily mung bean"],
  coffee: ["咖啡", "拿铁", "美式", "纸杯咖啡", "杯装咖啡", "costa", "coffee", "latte", "americano"],
  bowl: ["轻食", "鸡胸", "藜麦", "bowl", "chicken", "quinoa"]
};

const goalText = {
  balance: "均衡维持",
  fatLoss: "控糖减脂",
  muscle: "增肌恢复",
  heart: "心血管友好"
};

const recommendations = document.querySelector("#recommendations");
const coachMessage = document.querySelector("#coachMessage");
const plateCanvas = document.querySelector("#plateCanvas");
const ctx = plateCanvas.getContext("2d");

function collectState() {
  state.goal = document.querySelector("#goal").value;
  state.age = Number(document.querySelector("#age").value);
  state.sleep = Number(document.querySelector("#sleep").value);
  state.steps = Number(document.querySelector("#steps").value);
  state.glucose = document.querySelector("#glucose").value;
  state.restrictions = [...document.querySelectorAll("fieldset input:checked")].map((item) => item.value);
  document.querySelector("#sleepOutput").textContent = `${state.sleep} 小时`;
}

function buildPlan() {
  const food = foods[state.food];
  const activeScore = Math.min(18, Math.floor(state.steps / 700));
  const sleepScore = Math.max(0, Math.round((state.sleep - 4) * 7));
  const glucosePenalty = state.glucose === "rise" ? 12 : state.glucose === "drop" ? 7 : 0;
  const score = Math.max(45, Math.min(98, 58 + activeScore + sleepScore - glucosePenalty));
  const calorieBase = state.goal === "fatLoss" ? 1500 : state.goal === "muscle" ? 2050 : state.goal === "heart" ? 1680 : 1780;
  const calorie = calorieBase + (state.steps > 10000 ? 120 : 0) - (state.glucose === "rise" ? 90 : 0);
  const protein = state.goal === "muscle" ? 105 : state.goal === "fatLoss" ? 86 : 78;

  document.querySelector("#scoreValue").textContent = score;
  document.querySelector("#calorieValue").textContent = calorie;
  document.querySelector("#proteinValue").textContent = `${protein}g`;
  document.querySelector("#riskTag").textContent = score >= 82 ? "代谢风险低" : score >= 68 ? "需要关注血糖" : "建议优化作息";
  document.querySelector("#updatedAt").textContent = new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });

  const tips = [
    `当前目标为「${goalText[state.goal]}」，今日建议热量约 ${calorie} kcal，优先保证蛋白质 ${protein}g。`,
    state.glucose === "rise"
      ? "餐后血糖偏高，下一餐减少精制主食，增加蔬菜和优质蛋白。"
      : state.glucose === "drop"
        ? "血糖有回落趋势，运动后可补充少量全谷物和水果。"
        : "血糖趋势稳定，可以保持目前主食比例，并关注晚餐脂肪摄入。",
    state.sleep < 6.5
      ? "睡眠不足会影响食欲调节，今晚建议减少咖啡因并提前安排晚餐。"
      : "睡眠状态良好，适合安排中等强度运动并维持规律进餐。",
    state.restrictions.includes("lactose")
      ? "已避开乳制品，推荐无糖豆浆、豆腐、鱼虾或鸡蛋补充蛋白。"
      : `当前餐食估算蛋白 ${food.protein}g，可作为今日主要蛋白来源之一。`
  ];

  recommendations.innerHTML = tips.map((tip) => `<li>${tip}</li>`).join("");
  coachMessage.textContent = `我会根据你的${goalText[state.goal]}目标、可穿戴数据和餐食记录动态调整建议。今天的重点是：${tips[1]}`;
  drawPlate(food);
}

function drawPlate(food) {
  ctx.clearRect(0, 0, 280, 280);
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(140, 140, 116, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 16;
  ctx.strokeStyle = "#dce4dd";
  ctx.stroke();

  const total = food.carbs + food.protein + food.fat;
  const segments = [
    { label: "碳水", value: food.carbs, color: "#d8a637" },
    { label: "蛋白", value: food.protein, color: "#2f8a57" },
    { label: "脂肪", value: food.fat, color: "#d9634f" }
  ];

  let start = -Math.PI / 2;
  segments.forEach((segment) => {
    const angle = (segment.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(140, 140);
    ctx.arc(140, 140, 95, start, start + angle);
    ctx.closePath();
    ctx.fillStyle = segment.color;
    ctx.fill();
    start += angle;
  });

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(140, 140, 45, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1e2b24";
  ctx.font = "700 18px Microsoft YaHei, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("膳食", 140, 135);
  ctx.font = "13px Microsoft YaHei, sans-serif";
  ctx.fillStyle = "#65756b";
  ctx.fillText("平衡图", 140, 156);
}

function setFood(foodKey) {
  state.food = foodKey;
  const food = foods[foodKey];
  const categoryButton = document.querySelector(`.segmented button[data-food="${foodKey}"]`);
  document.querySelector("#foodName").textContent = categoryButton ? `餐食类别：${categoryButton.textContent}` : "餐食类别";
  document.querySelector("#foodMacro").textContent = food.macro;
  document.querySelector("#foodImage").className = `food-image ${foodKey === "bowl" ? "" : foodKey}`.trim();
  document.querySelectorAll(".segmented button").forEach((button) => {
    button.classList.toggle("selected", button.dataset.food === foodKey);
  });
  buildPlan();
}

function classifyFoodByName(fileName) {
  const name = String(fileName || "").toLowerCase();
  for (const [foodKey, aliases] of Object.entries(foodAliases)) {
    if (aliases.some((alias) => name.includes(alias.toLowerCase()))) {
      return foodKey;
    }
  }
  return "bowl";
}

function mapModelFood(label, dishName = "") {
  const text = `${label || ""} ${dishName || ""}`.toLowerCase();
  if (!text.trim()) return null;
  for (const foodKey of Object.keys(foods)) {
    if (foodKey.toLowerCase() === String(label || "").toLowerCase() || text.includes(foods[foodKey].name.toLowerCase())) {
      return foodKey;
    }
  }
  for (const [foodKey, aliases] of Object.entries(foodAliases)) {
    if (aliases.some((alias) => text.includes(alias.toLowerCase()))) {
      return foodKey;
    }
  }
  return null;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function recognizeFoodWithVisionModel(file) {
  const imageDataUrl = await fileToDataUrl(file);
  const response = await fetch(VISION_PROXY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imageDataUrl,
      labels: Object.entries(foods).map(([key, value]) => ({ key, name: value.name }))
    })
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `视觉识别接口异常：${response.status}`);
  }
  const result = await response.json();
  const foodKey = result.foodKey || mapModelFood(result.label, (result.ingredients || []).join(" "));
  if (!foodKey || !foods[foodKey]) {
    throw new Error("视觉识别结果未匹配到营养分类");
  }
  const ingredients = Array.isArray(result.ingredients)
    ? result.ingredients.map((item) => String(item).trim()).filter(Boolean).slice(0, 12)
    : [];
  if (!ingredients.length) {
    throw new Error("大模型没有返回可用的食材列表");
  }
  return {
    foodKey,
    ingredients,
    nutrition: result.nutrition || {},
    confidence: result.confidence
  };
}

function formatNutrition(nutrition, fallback) {
  const calories = Number(nutrition.calories);
  const protein = Number(nutrition.protein);
  const carbs = Number(nutrition.carbs);
  const fat = Number(nutrition.fat);
  if (![calories, protein, carbs, fat].every(Number.isFinite)) return fallback.macro;
  return `约 ${Math.round(calories)} kcal · 蛋白 ${Math.round(protein)}g · 碳水 ${Math.round(carbs)}g · 脂肪 ${Math.round(fat)}g`;
}

function applyIngredientRecognition(result) {
  setFood(result.foodKey);
  document.querySelector("#foodName").textContent = `识别食材：${result.ingredients.join("、")}`;
  document.querySelector("#foodMacro").textContent = formatNutrition(result.nutrition, foods[result.foodKey]);
  const confidenceText = Number.isFinite(Number(result.confidence))
    ? `，整体置信度 ${Math.round(Number(result.confidence) * 100)}%`
    : "";
  document.querySelector("#recognitionStatus").textContent = `大模型识别完成：${result.ingredients.join("、")}${confidenceText}。营养数据为图片估算值。`;
}

function applyRecognition(foodKey, message, detail = "") {
  setFood(foodKey);
  const categoryButton = document.querySelector(`.segmented button[data-food="${foodKey}"]`);
  const categoryName = categoryButton ? categoryButton.textContent : "餐食";
  document.querySelector("#recognitionStatus").textContent = `${message}，餐食类别为：${categoryName}。${detail}`;
}

function simulateScan() {
  const keys = Object.keys(foods);
  const foodKey = keys[state.recognitionIndex % keys.length];
  state.recognitionIndex += 1;
  applyRecognition(foodKey, "模拟识别完成");
}

function answerCoach() {
  const question = document.querySelector("#coachInput").value.trim();
  const food = foods[state.food];
  if (!question) return;
  const glucoseNote = state.glucose === "rise" ? "主食减半，优先选择全谷物。" : "主食可以保留一拳左右。";
  coachMessage.textContent = `关于「${question}」：下一餐建议补足深色蔬菜和水分，${glucoseNote} 我会继续结合步数、睡眠和餐后血糖更新计划。`;
  document.querySelector("#coachInput").value = "";
}

document.querySelector("#profileForm").addEventListener("input", () => {
  collectState();
  buildPlan();
});

document.querySelectorAll(".segmented button").forEach((button) => {
  button.addEventListener("click", () => {
    setFood(button.dataset.food);
    document.querySelector("#recognitionStatus").textContent = `已手动选择餐食类别：${button.textContent}，营养卡已更新。`;
  });
});

function setRecognitionLoading(isLoading) {
  const loading = document.querySelector("#recognitionLoading");
  const upload = document.querySelector("#foodUpload");
  const uploadLabel = document.querySelector('label[for="foodUpload"]');
  const simulateButton = document.querySelector("#simulateScan");

  loading.hidden = !isLoading;
  upload.disabled = isLoading;
  simulateButton.disabled = isLoading;
  uploadLabel.classList.toggle("is-disabled", isLoading);
  uploadLabel.setAttribute("aria-disabled", String(isLoading));
}

document.querySelector("#foodUpload").addEventListener("change", (event) => {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const preview = document.querySelector("#foodImage");
  preview.style.backgroundImage = `url("${URL.createObjectURL(file)}")`;
  preview.style.backgroundSize = "cover";
  preview.style.backgroundPosition = "center";
  preview.style.backgroundRepeat = "no-repeat";
  const status = document.querySelector("#recognitionStatus");
  setRecognitionLoading(true);
  document.querySelector("#foodName").textContent = "正在识别食材…";
  document.querySelector("#foodMacro").textContent = "正在分析图片和估算营养数据";
  status.textContent = `正在识别：${file.name}，请勿重复选择图片…`;
  recognizeFoodWithVisionModel(file)
    .then((result) => {
      applyIngredientRecognition(result);
    })
    .catch((error) => {
      status.textContent = `识别失败：${error.message}。未使用文件名猜测结果，请检查大模型配置后重试。`;
      document.querySelector("#foodName").textContent = "食材识别失败";
      document.querySelector("#foodMacro").textContent = "请检查配置或更换图片后重试";
    })
    .finally(() => {
      setRecognitionLoading(false);
      event.target.value = "";
    });
});

document.querySelector("#simulateScan").addEventListener("click", simulateScan);

document.querySelector("#refreshPlan").addEventListener("click", () => {
  collectState();
  buildPlan();
});

document.querySelector("#askCoach").addEventListener("click", answerCoach);
document.querySelector("#coachInput").addEventListener("keydown", (event) => {
  if (event.key === "Enter") answerCoach();
});

collectState();
buildPlan();
