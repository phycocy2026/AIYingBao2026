const map = {
  "meat loaf": "肉类熟食",
  "burrito": "混合主食",
  "guacamole": "蔬菜/酱料类",
  "plate": "餐盘类",
  "bagel": "面包类",
  "rice": "米饭类",
  "noodle": "面食类",
  "salad": "蔬菜沙拉类",
  "fruit": "水果类"
};

function translate(name){
  return map[String(name).toLowerCase()] || "其他食物";
}

module.exports = { translate };