'use strict';
var notas=[];
const caixa=document.getElementById("caixavib");
var cpos=0;


const insnota=document.getElementById("insnota");
const remnota=document.getElementById("remnota");
const desfazer=document.getElementById("desfazer");
const tocar=document.getElementById("tocar");
let ns=document.querySelectorAll(".notavib")
var notasel;
var selecionando=false;
var arrastando=false;
var pegando=false;
var offx;

tocar.addEventListener("click",()=>{
	if ('vibrate' in navigator) {
		
	navigator.vibrate([200,200]);	
	
	}
});
function inserir()
{
	
const nota=document.createElement("div");
nota.className="notavib";
nota.style.left=0+"px";
nota.style.width="100px";
nota.id=cpos;
notas[cpos]={a:0,b:80};
cpos+=1;

const pega1=document.createElement("div");
pega1.className="pegasnotavib";
pega1.style.left=-15+"px";
pega1.style.display="none";
const pega2=document.createElement("div");
pega2.className="pegasnotavib";
pega2.style.left=50+30+"px";
pega2.style.display="none";

nota.appendChild(pega1);
nota.appendChild(pega2);

caixa.appendChild(nota);
nota.style.cursor="grab;"
	pega1.addEventListener("mousedown",(event)=>{
		
	pegando=true;
		
	});
	pega1.addEventListener("mouseup",(event)=>{
		
	pegando=false;
	pega1.style.display="none";
	pega2.style.display="none";
	});
	
	
	pega2.addEventListener("mousedown",(event)=>{
		
	pegando=true;
		
	});
	pega2.addEventListener("mouseup",(event)=>{
		
	pegando=false;
	pega1.style.display="none";
	pega2.style.display="none";
		
	});

	nota.addEventListener("mousedown",(event)=>{
	nota.style.cursor="grabbing";
	nota.style.borderWidth="1%";
	nota.style.border="solid";
	nota.style.borderColor="yellow";
	if(pegando==false)
	{
	pega1.style.display="none";
	pega2.style.display="none";
	}
	if(selecionando==true&&notasel!=nota)
	{notasel.style.border="none";
	notasel=null;}
	
	pega1.style.display="block";
	pega2.style.display="block";
	
	notasel=nota;
	selecionando=true;
	arrastando=true;
	
	var trect=nota.getBoundingClientRect();
	offx=event.clientX-trect.left;
	var controlador=new AbortController();
	document.addEventListener("mouseup",(e)=>{

	if(e.target!=caixa){
	pega1.style.display="block";
	pega2.style.display="block";
	}
	nota.style.borderColor="red";
	nota.style.cursor="grab";
	arrastando=false;
	controlador.abort();
	},{signal:controlador.signal});
	});



	
}
insnota.addEventListener("click",inserir);

remnota.addEventListener("click",()=>{
	if(selecionando==true)
	{
	notasel.remove();
	selecionando=false;
	arrastando=false;
	notasel=null;
	}
});



caixa.addEventListener("mouseup",(event)=>{
	if(selecionando==true){
	pegando=false;
	notasel.children[0].style.display="none";
	notasel.children[1].style.display="none";
	console.log(notasel.children[0].style.display);
	}
	if(event.target.className!="notavib"&&selecionando==true)
	{
	selecionando=false;
	notasel.style.border="none";
	notasel=null;
	}
});

document.addEventListener('mouseup',()=>{
pegando=false;
if(selecionando==true)
{
notasel.children[0].style.display="none";
notasel.children[1].style.display="none";	
}
});

document.addEventListener("mousemove",(event)=>{
if(selecionando==true&&arrastando==true&&pegando==false){

var trect=event.target.getBoundingClientRect();
var crect=caixa.getBoundingClientRect();
var newx=event.clientX-offx;
if(newx<crect.left)newx=crect.left;
var cancel=0;
var notawidth=notas[notasel.id].b-parseInt(notasel.style.left.slice("px"));
for(let i=0;i<notas.length;i++)
{
if((newx-crect.left+notawidth>notas[i].a&&newx-crect.left<notas[i].b)&&i!=parseInt(notasel.id)){cancel=1;}
}
if(cancel==0)
{
notasel.style.left=(newx-crect.left)+"px";
notas[notasel.id].a=newx-crect.left;
notas[notasel.id].b=notawidth+newx-crect.left;
}

}

if(selecionando==true&&pegando==true){

var cancel=0;
if(cancel==0)
{
	
	

}

}

});



