const goals = [
  { value: "balance", label: "均衡维持" },
  { value: "fatLoss", label: "控糖减脂" },
  { value: "muscle", label: "增肌恢复" },
  { value: "heart", label: "心血管友好" }
];

const glucoseOptions = [
  { value: "stable", label: "稳定" },
  { value: "rise", label: "偏高" },
  { value: "drop", label: "偏低" }
];

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

const VISION_CLOUD_FUNCTION = "recognizeFoodImage";

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

Page({
  data: {
    goalOptions: goals,
    goalIndex: 0,
    glucoseOptions,
    glucoseIndex: 0,
    restrictionOptions: [
      { value: "lactose", label: "乳糖不耐", active: false, activeClass: "" },
      { value: "lowSalt", label: "低盐", active: false, activeClass: "" },
      { value: "vegetarian", label: "素食优先", active: false, activeClass: "" }
    ],
    foodOptions: [
      { key: "bowl", label: "轻食碗", active: true, activeClass: "selected" },
      { key: "noodle", label: "面食", active: false, activeClass: "" },
      { key: "salad", label: "沙拉", active: false, activeClass: "" },
      { key: "rice", label: "米饭套餐", active: false, activeClass: "" },
      { key: "beefRice", label: "牛肉盖饭", active: false, activeClass: "" },
      { key: "beefNoodle", label: "牛肉面", active: false, activeClass: "" },
      { key: "porridge", label: "粥品", active: false, activeClass: "" },
      { key: "bao", label: "包点", active: false, activeClass: "" },
      { key: "seafood", label: "鱼虾", active: false, activeClass: "" },
      { key: "hotpot", label: "火锅", active: false, activeClass: "" },
      { key: "burger", label: "汉堡", active: false, activeClass: "" },
      { key: "fruit", label: "水果", active: false, activeClass: "" },
      { key: "mungDrink", label: "百合绿豆水", active: false, activeClass: "" },
      { key: "coffee", label: "杯装咖啡", active: false, activeClass: "" }
    ],
    currentGoalLabel: goals[0].label,
    currentGlucoseLabel: glucoseOptions[0].label,
    age: 29,
    sleep: 7,
    steps: 8200,
    foodKey: "bowl",
    food: foods.bowl,
    score: 86,
    calorie: 1640,
    protein: 78,
    riskTag: "代谢风险低",
    updatedAt: "刚刚更新",
    recommendations: [],
    coachInput: "",
    coachMessage: "",
    recognitionStatus: "未识别图片，可点击“拍照/选图识别”或“模拟识别一次”。",
    recognitionIndex: 0
  },

  onLoad() {
    this.buildPlan();
  },

  onGoalChange(event) {
    const goalIndex = Number(event.detail.value);
    this.setData({ goalIndex, currentGoalLabel: goals[goalIndex].label }, () => this.buildPlan());
  },

  onGlucoseChange(event) {
    const glucoseIndex = Number(event.detail.value);
    this.setData({ glucoseIndex, currentGlucoseLabel: glucoseOptions[glucoseIndex].label }, () => this.buildPlan());
  },

  onAgeInput(event) {
    this.setData({ age: Number(event.detail.value) || 0 }, () => this.buildPlan());
  },

  onStepsInput(event) {
    this.setData({ steps: Number(event.detail.value) || 0 }, () => this.buildPlan());
  },

  onSleepChange(event) {
    this.setData({ sleep: Number(event.detail.value) }, () => this.buildPlan());
  },

  toggleRestriction(event) {
    const value = event.currentTarget.dataset.value;
    const restrictionOptions = this.data.restrictionOptions.map((item) => ({
      ...item,
      active: item.value === value ? !item.active : item.active,
      activeClass: item.value === value ? (!item.active ? "chip-active" : "") : item.activeClass
    }));
    this.setData({ restrictionOptions }, () => this.buildPlan());
  },

  chooseFood(event) {
    const foodKey = event.currentTarget.dataset.key;
    this.applyFoodRecognition(foodKey, `已手动选择：${foods[foodKey].name}`);
  },

  scanFood() {
    const choose = wx.chooseMedia
      ? wx.chooseMedia({
          count: 1,
          mediaType: ["image"],
          sourceType: ["album", "camera"],
          success: (res) => {
            const file = res.tempFiles && res.tempFiles[0] ? res.tempFiles[0].tempFilePath : "";
            this.handlePickedImage(file);
          },
          fail: () => {
            this.simulateFoodRecognition();
          }
        })
      : wx.chooseImage({
          count: 1,
          sourceType: ["album", "camera"],
          success: (res) => {
            const file = res.tempFilePaths && res.tempFilePaths[0] ? res.tempFilePaths[0] : "";
            this.handlePickedImage(file);
          },
          fail: () => {
            this.simulateFoodRecognition();
          }
        });
    return choose;
  },

  handlePickedImage(filePath) {
    if (!filePath) {
      this.simulateFoodRecognition();
      return;
    }
    this.setData({ recognitionStatus: "正在调用大模型识别图片，请稍候..." });
    this.recognizeFoodWithVisionModel(filePath)
      .then((result) => {
        const confidenceText = Number.isFinite(Number(result.confidence)) ? `，置信度 ${Math.round(Number(result.confidence) * 100)}%` : "";
        this.applyFoodRecognition(result.foodKey, `大模型识别完成：${result.dishName || foods[result.foodKey].name}${confidenceText}`);
      })
      .catch((error) => {
        const foodKey = this.classifyFoodByPath(filePath);
        this.applyFoodRecognition(foodKey, `本地识别完成：${foods[foodKey].name}（${error.message || "大模型暂不可用"}，已兜底）`);
      });
  },

  simulateFoodRecognition() {
    const keys = this.data.foodOptions.map((item) => item.key);
    const foodKey = keys[this.data.recognitionIndex % keys.length];
    this.setData({ recognitionIndex: this.data.recognitionIndex + 1 });
    this.applyFoodRecognition(foodKey, `模拟识别完成：${foods[foodKey].name}`);
  },

  classifyFoodByPath(filePath) {
    const name = String(filePath || "").toLowerCase();
    for (const [foodKey, aliases] of Object.entries(foodAliases)) {
      if (aliases.some((alias) => name.includes(alias.toLowerCase()))) {
        return foodKey;
      }
    }
    return "bowl";
  },

  recognizeFoodWithVisionModel(filePath) {
    return new Promise((resolve, reject) => {
      if (!wx.cloud || !wx.cloud.callFunction) {
        reject(new Error("未启用微信云开发"));
        return;
      }
      wx.getFileSystemManager().readFile({
        filePath,
        encoding: "base64",
        success: (fileResult) => {
          wx.cloud.callFunction({
            name: VISION_CLOUD_FUNCTION,
            data: {
              imageBase64: fileResult.data,
              labels: Object.entries(foods).map(([key, value]) => ({ key, name: value.name }))
            },
            success: (cloudResult) => {
              const result = cloudResult.result || {};
              const foodKey = result.foodKey || this.mapModelFood(result.label, result.dishName || result.dish_name);
              if (!foodKey || !foods[foodKey]) {
                reject(new Error("大模型结果未匹配到营养分类"));
                return;
              }
              resolve({
                foodKey,
                dishName: result.dishName || result.dish_name || result.label || foods[foodKey].name,
                confidence: result.confidence
              });
            },
            fail: (error) => reject(new Error(error.errMsg || "云函数调用失败"))
          });
        },
        fail: () => reject(new Error("图片读取失败"))
      });
    });
  },

  mapModelFood(label, dishName = "") {
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
  },

  applyFoodRecognition(foodKey, status) {
    const foodOptions = this.data.foodOptions.map((item) => ({
      ...item,
      active: item.key === foodKey,
      activeClass: item.key === foodKey ? "selected" : ""
    }));
    this.setData({
      foodKey,
      food: foods[foodKey],
      foodOptions,
      recognitionStatus: status
    }, () => this.buildPlan());
  },

  refreshPlan() {
    this.buildPlan();
    wx.showToast({
      title: "已更新建议",
      icon: "success"
    });
  },

  onCoachInput(event) {
    this.setData({ coachInput: event.detail.value });
  },

  askCoach() {
    const question = this.data.coachInput.trim();
    if (!question) return;

    const glucose = glucoseOptions[this.data.glucoseIndex].value;
    const glucoseNote = glucose === "rise" ? "主食减半，优先选择全谷物。" : "主食可以保留一拳左右。";
    this.setData({
      coachInput: "",
      coachMessage: `关于“${question}”：如果今晚已吃过${this.data.food.name}，下一餐建议补足深色蔬菜和水分，${glucoseNote}我会继续结合步数、睡眠和餐后血糖更新计划。`
    });
  },

  buildPlan() {
    const goal = goals[this.data.goalIndex].value;
    const glucose = glucoseOptions[this.data.glucoseIndex].value;
    const activeScore = Math.min(18, Math.floor(this.data.steps / 700));
    const sleepScore = Math.max(0, Math.round((this.data.sleep - 4) * 7));
    const glucosePenalty = glucose === "rise" ? 12 : glucose === "drop" ? 7 : 0;
    const score = Math.max(45, Math.min(98, 58 + activeScore + sleepScore - glucosePenalty));
    const calorieBase = goal === "fatLoss" ? 1500 : goal === "muscle" ? 2050 : goal === "heart" ? 1680 : 1780;
    const calorie = calorieBase + (this.data.steps > 10000 ? 120 : 0) - (glucose === "rise" ? 90 : 0);
    const protein = goal === "muscle" ? 105 : goal === "fatLoss" ? 86 : 78;
    const activeRestrictions = this.data.restrictionOptions.filter((item) => item.active).map((item) => item.value);
    const food = this.data.food;

    const tips = [
      `当前目标为“${goals[this.data.goalIndex].label}”，今日建议热量约 ${calorie} kcal，优先保证蛋白质 ${protein}g。`,
      glucose === "rise"
        ? "餐后血糖偏高，下一餐减少精制主食，增加蔬菜和优质蛋白。"
        : glucose === "drop"
          ? "血糖有回落趋势，运动后可补充少量全谷物和水果。"
          : "血糖趋势稳定，可以保持目前主食比例，并关注晚餐脂肪摄入。",
      this.data.sleep < 6.5
        ? "睡眠不足会影响食欲调节，今晚建议减少咖啡因并提前安排晚餐。"
        : "睡眠状态良好，适合安排中等强度运动并维持规律进餐。",
      activeRestrictions.includes("lactose")
        ? "已避开乳制品，推荐无糖豆浆、豆腐、鱼虾或鸡蛋补充蛋白。"
        : `识别到“${food.name}”，本餐蛋白 ${food.protein}g，可作为今日主要蛋白来源之一。`
    ];

    this.setData({
      score,
      calorie,
      protein,
      riskTag: score >= 82 ? "代谢风险低" : score >= 68 ? "关注血糖" : "优化作息",
      updatedAt: this.formatTime(new Date()),
      recommendations: tips,
      coachMessage: `我会根据你的${goals[this.data.goalIndex].label}目标、可穿戴数据和餐食记录动态调整建议。今天的重点是：${tips[1]}`
    });
  },

  formatTime(date) {
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    return `${hour}:${minute} 更新`;
  }
});
