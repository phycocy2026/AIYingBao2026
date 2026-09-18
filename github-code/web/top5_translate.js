// AI智营宝 Top-5中文显示模块
const foodTop5Chinese = {
  "meat loaf": "肉卷/肉饼类",
  "meatloaf": "肉卷/肉饼类",
  "burrito": "墨西哥卷饼",
  "guacamole": "牛油果酱",
  "plate": "餐盘",
  "bagel": "贝果面包",
  "beigel": "贝果面包",
  "beef": "牛肉",
  "steak": "牛排",
  "roast beef": "烤牛肉",
  "rice": "米饭",
  "noodle": "面条",
  "ramen": "拉面",
  "salad": "沙拉",
  "chicken": "鸡肉",
  "fish": "鱼",
  "shrimp": "虾",
  "coffee": "咖啡",
  "milk tea": "奶茶"
};

function translateTop5(name){
  const text = String(name || "").toLowerCase().trim();

  for (const key of Object.keys(foodTop5Chinese)){
    if(text.includes(key)){
      return foodTop5Chinese[key];
    }
  }

  return name;
}
