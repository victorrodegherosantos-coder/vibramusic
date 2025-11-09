let titlebs=document.querySelectorAll(".title")
let buttons=document.querySelectorAll("button")
const vibr=new Audio('vib.mp3');
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
function tocarnota(tempo)
{
vibr.currentTime=0;
vibr.play();
setTimeout(()=>{vibr.pause()},tempo);
}
function emularvib(faixa)
{
var delay=0;
for(let i=0;i<faixa.length;i+=2)
{
if(i==0)
{
tocarnota(faixa[i]);
setTimeout(()=>{console.log("e")},faixa[i+1]);
delay+=faixa[i]+faixa[i+1];
}
else{
setTimeout(()=>{
	
tocarnota(faixa[i]);
setTimeout(()=>{console.log("e")},faixa[i+1]);
},delay);
delay+=faixa[i]+faixa[i+1];
}


}

}

var vibras=[];
var vibraquant=0;

const seletor=document.getElementById("seletorarquivob");
const stat=document.getElementById("status");
var vb;
seletor.addEventListener('change',function(e){
const arq=e.target.files[0];
if(!arq){
stat.innerText="Arquivo Falho.";
}

const reader=new FileReader();

reader.onload=function(ev)
{
const conteudo=ev.target.result;

console.log(conteudo);
if(conteudo.slice(0,5)!="VIBRA")
{
stat.innerText="Arquivo Incorreto.";
}else{
stat.innerText="Sucesso!";
vibraquant=conteudo.length-5;
vb=conteudo.slice(5,vibraquant+6);

vibras=vb.split(",");
for(let i=0;i<vibras.length;i++)
{
vibras[i]=parseInt(vibras[i]);
}
console.log(vibras);
}
};

reader.readAsText(arq,'utf8');
	
});

document.getElementById("tocarvib").addEventListener("click",()=>{
navigator.vibrate(vibras);
emularvib(vibras);
});
