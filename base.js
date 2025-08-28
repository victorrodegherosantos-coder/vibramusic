let titlebs=document.querySelectorAll(".title")
let buttons=document.querySelectorAll("button")

var curd;
function efeitodown(el){

let but=document.getElementById(el);

but.classList.toggle("dipped");

curd=but
}
document.addEventListener("mouseup",()=>{
  if(curd){
  curd.classList.toggle("dipped");
   
    curd=null;
  }
  
})

titlebs.forEach(el=>{
  
  
el.addEventListener("click",()=>
{
window.location.href=""
})
  

})
