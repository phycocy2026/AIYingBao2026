const API =
"/api/vision-recognition";



const top5CN={


"meat loaf":"肉类熟食",

"burrito":"混合主食",

"guacamole":"蔬菜/酱料类",

"plate":"餐盘类",

"bagel":"面包类",

"rice":"米饭类",

"noodle":"面食类",

"salad":"蔬菜沙拉类",

"fruit":"水果类"


};



function translateTop5(name){

return top5CN[name.toLowerCase()]
||
name;

}



async function uploadImage(){


const file=
document
.getElementById("foodUpload")
.files[0];


if(!file)return;



const reader=
new FileReader();



reader.onload=async()=>{


const response=
await fetch(
API,
{

method:"POST",

headers:{
"Content-Type":
"application/json"
},

body:JSON.stringify({

imageDataUrl:
reader.result

})

});


const data=
await response.json();



/**********
 食材类别
***********/


document
.getElementById("foodName")
.innerText=
data.foodCategory;



document
.getElementById("foodMacro")
.innerText=
`
${data.nutrition.calories}
kcal ｜
蛋白质${data.nutrition.protein}g ｜
碳水${data.nutrition.carbs}g
`;




/**********
 食材列表
***********/


const ing=
document.getElementById(
"ingredients"
);


if(ing){

ing.innerHTML=
data.ingredients
.map(
x=>`<li>${x}</li>`
)
.join("");

}




/**********
 Top5
***********/


const top5=
document.getElementById(
"top5"
);



if(top5 && data.top5){


top5.innerHTML=
data.top5
.map(
x=>
`
<li>
${translateTop5(x.name)}
：
${x.score.toFixed(2)}%
</li>
`
)
.join("");

}



};



reader.readAsDataURL(file);


}



document
.getElementById("foodUpload")
?.addEventListener(
"change",
uploadImage
);
