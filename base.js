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
window.location.href="";
})
  

})
var vibras=[];
var vibraquant=0;
const seletor=document.getElementById("seletorarquivob");
const stat=document.getElementById("status");
var vb;
seletor.addEventListener('change',function(e){
const arq=e.target.files[0];
if(!arq){
stat.innerText="Arquivo Falho."
}

const reader=new FileReader();

reader.onload=function(ev)
{
const conteudo=ev.target.result;
if(conteudo.slice(0,5)!="vibra")
{
stat.innerText="Arquivo Incorreto.";
}else{
stat.innerText="Sucesso!";
vibraquant=conteudo.charCodeAt(5);
vb=conteudo.slice(6,6+vibraquant*4);
for(let i=0;i<vibraquant;i++)
{
vibras[i]=parseInt(vb.slice(i*4,i*4+4));
console.log(vb.slice(i*4,i*4+4));
	
}
console.log(conteudo);

}
};

reader.readAsText(arq,'utf8');
	
});

document.getElementById("tocarvib").addEventListener("click",()=>{
navigator.vibrate(vibras);
});
