// AI智营宝 AI Top-5 中文转换

window.translateTop5 = function(name){

    const map = {
        "meat loaf": "肉卷/肉饼",
        "meatloaf": "肉卷/肉饼",
        "burrito": "墨西哥卷饼",
        "guacamole": "牛油果酱",
        "plate": "餐盘",
        "bagel": "贝果面包",
        "beigel": "贝果面包",
        "beef": "牛肉",
        "rice": "米饭",
        "noodle": "面条",
        "salad": "沙拉",
        "chicken": "鸡肉",
        "fish": "鱼",
        "shrimp": "虾"
    };

    const text = String(name || "").toLowerCase();

    for (const key in map){
        if(text.includes(key)){
            return map[key];
        }
    }

    return name;
};
