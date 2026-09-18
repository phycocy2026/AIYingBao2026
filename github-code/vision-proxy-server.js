const http = require("http");
const https = require("https");

const PORT = process.env.PORT || 8787;

const API_KEY =
process.env.DASHSCOPE_API_KEY ||
process.env.AIYINGBAO_VISION_API_KEY;


const API_URL =
"https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";



function requestAI(payload){

return new Promise((resolve,reject)=>{

const body=JSON.stringify(payload);

const url=new URL(API_URL);


const req=https.request(url,{
method:"POST",
headers:{
"Authorization":`Bearer ${API_KEY}`,
"Content-Type":"application/json",
"Content-Length":Buffer.byteLength(body)
}
},res=>{

let data="";

res.on("data",d=>data+=d);

res.on("end",()=>{

resolve(JSON.parse(data));

});


});


req.on("error",reject);

req.write(body);

req.end();


});


}



async function recognize(image){


const result=await requestAI({

model:"qwen3-vl-plus",

temperature:0.05,


messages:[

{
role:"system",

content:`

你是AI智营宝健康营养识别助手。

任务：

1. 识别图片中的主要食材。
2. 只能输出粗粒度食品类别。
3. 禁止生成具体菜名。


禁止：
温泉蛋牛肉盖饭
鸡胸藜麦碗
牛肉套餐
宫保鸡丁


允许：

牛肉类主食
猪肉类
鸡肉类
鱼虾类
米饭类餐食
面食类
蔬菜类
水果类
蛋奶类
混合餐食


返回严格JSON。
`

},


{
role:"user",

content:[

{
type:"text",

text:
`
分析图片。

返回：

{
"foodCategory":"",
"ingredients":[],
"nutrition":{
"calories":0,
"protein":0,
"carbs":0,
"fat":0
},
"confidence":0,

"top5":[
{
"name":"",
"score":0
}
]

}

score为百分比。
`

},

{
type:"image_url",
image_url:{
url:image
}

}

]

}

]

});


let text =
result.choices[0].message.content
.replace(/```json/g,"")
.replace(/```/g,"")
.trim();



return JSON.parse(text);


}




http.createServer(async(req,res)=>{


res.setHeader(
"Access-Control-Allow-Origin",
"*"
);


if(req.method==="GET"){

res.end(
"AI智营宝 V3.2.3 API Running"
);

return;

}



if(req.method==="POST" &&
req.url==="/api/vision-recognition"){


let body="";


req.on("data",
d=>body+=d);



req.on("end",async()=>{


try{


const data=JSON.parse(body);


const result=
await recognize(
data.imageDataUrl
);



res.writeHead(200,{
"Content-Type":
"application/json;charset=utf-8"
});


res.end(
JSON.stringify(result)
);



}catch(e){

res.writeHead(500);

res.end(JSON.stringify({
error:e.message
}));

}


});


}


}).listen(PORT,()=>{

console.log(
"AI智营宝 V3.2.3 running"
);

});
