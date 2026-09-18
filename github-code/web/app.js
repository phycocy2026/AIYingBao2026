async function uploadImage(){
 const file=document.getElementById("upload").files[0];
 if(!file)return;
 const reader=new FileReader();
 reader.onload=async()=>{
  const res=await fetch("/api/vision-recognition",{
   method:"POST",
   headers:{"Content-Type":"application/json"},
   body:JSON.stringify({imageDataUrl:reader.result})
  });
  const data=await res.json();
  document.getElementById("category").innerHTML=data.foodCategory;
  document.getElementById("ingredients").innerHTML=data.ingredients.map(x=>"<li>"+x+"</li>").join("");
  document.getElementById("nutrition").innerHTML=
  `热量 ${data.nutrition.calories} kcal | 蛋白质 ${data.nutrition.protein} g`;
 };
 reader.readAsDataURL(file);
}