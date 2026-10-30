/* Atlante dell'Automobile — script condiviso.
   Registro delle voci + rilevamento delle schede pubblicate + testata, piede, link contestuali.
   Una scheda è "pubblicata" se esiste schede/<slug>.js (marcatore) e schede/<slug>.html.
   Il marcatore chiama ATLANTE.publish(meta, nuoveVoci): nessun file esistente va riscritto per aggiungere una scheda. */
(function(){
  'use strict';
  var A=window.ATLANTE=window.ATLANTE||{};
  var root=document.documentElement.getAttribute('data-root')||'';
  var TYPES={modello:'Modelli',persona:'Persone',tecnologia:'Tecnologie'};
  var TYPE1={modello:'modello',persona:'persona',tecnologia:'tecnologia'};

  /* registro iniziale: voci "in programma". Le nuove voci arrivano dai marcatori delle schede. */
  var E=[
    {s:'benz-patent-motorwagen-1886',t:'modello',n:'Benz Patent-Motorwagen',y:'1886',by:'Karl Benz'},
    {s:'daimler-motorkutsche-1886',t:'modello',n:'Daimler Motorkutsche',y:'1886',by:'Gottlieb Daimler, Wilhelm Maybach'},
    {s:'daimler-reitwagen-1885',t:'modello',n:'Daimler Reitwagen',y:'1885',by:'Gottlieb Daimler, Wilhelm Maybach'},
    {s:'panhard-levassor-1891',t:'modello',n:'Panhard & Levassor',y:'1891',by:'René Panhard, Émile Levassor'},
    {s:'duryea-motor-wagon-1893',t:'modello',n:'Duryea Motor Wagon',y:'1893',by:'Charles e Frank Duryea'},
    {s:'mercedes-35-ps-1901',t:'modello',n:'Mercedes 35 PS',y:'1901',by:'Wilhelm Maybach'},
    {s:'oldsmobile-curved-dash-1901',t:'modello',n:'Oldsmobile Curved Dash',y:'1901',by:'Ransom E. Olds'},
    {s:'ford-model-t-1908',t:'modello',n:'Ford Model T',y:'1908',by:'Henry Ford, Joseph Galamb, Eugene Farkas'},
    {s:'lancia-lambda-1922',t:'modello',n:'Lancia Lambda',y:'1922',by:'Vincenzo Lancia'},
    {s:'citroen-traction-avant-1934',t:'modello',n:'Citroën Traction Avant',y:'1934',by:'André Lefèbvre, Flaminio Bertoni'},
    {s:'volkswagen-typ-1-1938',t:'modello',n:'Volkswagen Typ 1',y:'1938',by:'Ferdinand Porsche'},
    {s:'mini-1959',t:'modello',n:'Austin Mini',y:'1959',by:'Alec Issigonis'},
    {s:'karl-benz',t:'persona',n:'Karl Benz',y:'1844'},
    {s:'bertha-benz',t:'persona',n:'Bertha Benz',y:'1849'},
    {s:'nikolaus-otto',t:'persona',n:'Nikolaus Otto',y:'1832'},
    {s:'gottlieb-daimler',t:'persona',n:'Gottlieb Daimler',y:'1834'},
    {s:'ciclo-quattro-tempi',t:'tecnologia',n:'Ciclo a quattro tempi',y:'1876'},
    {s:'accensione-bobina-vibrante',t:'tecnologia',n:'Accensione a bobina vibrante',y:''},
    {s:'carburatore-a-superficie',t:'tecnologia',n:'Carburatore a superficie',y:''},
    {s:'raffreddamento-termosifone',t:'tecnologia',n:'Raffreddamento a termosifone',y:''},
    {s:'differenziale',t:'tecnologia',n:'Differenziale',y:''},
    {s:'sterzo-cremagliera',t:'tecnologia',n:'Sterzo a cremagliera',y:''}
  ];
  var idx={};E.forEach(function(e){idx[e.s]=e;});
  function reg(e){if(idx[e.s]){for(var k in e){idx[e.s][k]=e[k];}}else{E.push(e);idx[e.s]=e;}}

  /* chiamata dai marcatori schede/<slug>.js */
  A.publish=function(meta,extra){
    meta.live=true;reg(meta);
    (extra||[]).forEach(function(x){if(!idx[x.s]){reg(x);}});
  };
  A.entries=function(){return E;};
  A.href=function(s){return root+'schede/'+s+'.html';};

  /* rilevamento schede: carica schede/<slug>.js per ogni voce, ripetendo finché compaiono nuove voci */
  var tried={},waiting=[],finished=false;
  function pump(){
    var todo=E.filter(function(e){return !tried[e.s];});
    if(!todo.length){finished=true;waiting.splice(0).forEach(function(f){f();});return;}
    var left=todo.length;
    todo.forEach(function(e){
      tried[e.s]=1;
      var sc=document.createElement('script');
      sc.src=root+'schede/'+e.s+'.js';
      var done=function(){sc.onload=sc.onerror=null;if(--left===0){pump();}};
      sc.onload=done;sc.onerror=done;
      document.head.appendChild(sc);
    });
  }
  A.ready=function(f){if(finished){f();}else{waiting.push(f);}};

  /* utilità DOM */
  function el(tag,cls,txt){var n=document.createElement(tag);if(cls){n.className=cls;}if(txt!=null){n.textContent=txt;}return n;}
  function link(cls,txt,href){var a=el('a',cls,txt);a.href=href;return a;}
  function dateFmt(d){return d?d.replace(/-/g,'.'):'';}

  /* tema chiaro/scuro */
  function theme(v){
    document.documentElement.setAttribute('data-theme',v);
    try{localStorage.setItem('atlante-tema',v);}catch(x){}
  }
  try{var st=localStorage.getItem('atlante-tema');if(st==='dark'||st==='light'){document.documentElement.setAttribute('data-theme',st);}}catch(x){}

  /* testata e piede */
  function chrome(){
    var top=document.getElementById('top');
    if(top){
      top.className='top';
      top.appendChild(link('logo','atlante/',root+'index.html'));
      top.appendChild(link('mid','Archivio',root+'index.html#archivio'));
      var b=el('button','tg','Tema');b.type='button';b.setAttribute('aria-label','Passa tra tema chiaro e scuro');
      b.addEventListener('click',function(){
        var cur=document.documentElement.getAttribute('data-theme');
        var dark=cur?cur==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;
        theme(dark?'light':'dark');
      });
      top.appendChild(b);
    }
    var foot=document.getElementById('foot');
    if(foot){
      foot.className='foot';
      var up=link('up','',"#");
      up.setAttribute('aria-label','Torna in alto');
      up.innerHTML='<svg width="20" height="22" viewBox="0 0 20 22" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21V11C3 6 6 3 11 3H17M13 .5L17 3L13 5.5"/></svg>';
      up.addEventListener('click',function(ev){ev.preventDefault();window.scrollTo({top:0,behavior:'smooth'});});
      foot.appendChild(up);
      var r1=el('div','fr');r1.appendChild(el('span','','A'));
      var c1=el('div');c1.appendChild(document.createTextNode("Atlante dell'Automobile"));c1.appendChild(el('br'));
      c1.appendChild(document.createTextNode('Schede per modello, persona e tecnologia.'));c1.appendChild(el('br'));
      c1.appendChild(link('',"Archivio",root+'index.html#archivio'));r1.appendChild(c1);foot.appendChild(r1);
      var r2=el('div','fr');r2.appendChild(el('span','','S'));
      var c2=el('div');c2.id='foot-state';c2.textContent=' ';r2.appendChild(c2);foot.appendChild(r2);
      foot.appendChild(el('p','copy','©2026 Atlante dell\'Automobile'));
    }
  }

  function footState(){
    var c=document.getElementById('foot-state');if(!c){return;}
    var live=E.filter(function(e){return e.live;}).length;
    c.textContent='';
    c.appendChild(document.createTextNode(live+(live===1?' scheda pubblicata':' schede pubblicate')+' su '+E.length+'.'));
    var next=E.filter(function(e){return !e.live&&e.t==='modello';})[0];
    if(next){c.appendChild(el('br'));c.appendChild(document.createTextNode('Prossimo modello: '+next.n+'.'));}
  }

  /* link contestuali */
  function refs(){
    [].forEach.call(document.querySelectorAll('a[data-ref]'),function(a){
      var s=a.getAttribute('data-ref');a.classList.add('ref');
      if(idx[s]&&idx[s].live){a.setAttribute('href',A.href(s));}
      else{a.classList.add('pending');a.setAttribute('title','Scheda in arrivo');}
    });
  }

  /* home: ultime schede e archivio */
  function row(e,mode){
    var li=el('li','tr '+(e.live?'live':'soon'));
    var tg=el('span','tg',mode==='news'?(e.__new?'new':TYPE1[e.t]):(e.live&&e.no?e.no:'—'));
    var dt=el('span','dt',mode==='news'?dateFmt(e.date):e.y);
    var ti=el('span','ti');
    if(e.live){ti.appendChild(link('',e.n,A.href(e.s)));}else{ti.appendChild(document.createTextNode(e.n));}
    var sub=mode==='news'?(e.sum||e.by):e.by;
    if(sub){ti.appendChild(el('span','by',sub));}
    li.appendChild(tg);li.appendChild(dt);li.appendChild(ti);
    li.appendChild(e.live?link('lk','Vedi scheda',A.href(e.s)):el('span','lk','In programma'));
    return li;
  }
  function home(){
    var news=document.getElementById('news-list'),box=document.getElementById('lists');
    if(!news||!box){return;}
    var pub=E.filter(function(e){return e.live;}).sort(function(a,b){
      return (b.date||'').localeCompare(a.date||'')||(b.no||'').localeCompare(a.no||'');
    });
    if(pub.length){pub[0].__new=true;}
    news.textContent='';
    if(!pub.length){var li=el('li','tr soon');li.appendChild(el('span','tg',''));li.appendChild(el('span','dt',''));li.appendChild(el('span','ti','Nessuna scheda pubblicata.'));news.appendChild(li);}
    pub.slice(0,6).forEach(function(e){news.appendChild(row(e,'news'));});
    box.textContent='';
    ['modello','persona','tecnologia'].forEach(function(t,i){
      var items=E.filter(function(e){return e.t===t;});
      var n=items.filter(function(e){return e.live;}).length;
      var g=el('section','grp');g.id='g-'+t;
      var h=el('h2','hd',TYPES[t]);h.appendChild(el('small','',n+' pubblicate su '+items.length));g.appendChild(h);
      var ol=el('ol','tbl');items.forEach(function(e){ol.appendChild(row(e,'list'));});g.appendChild(ol);box.appendChild(g);
      var nav=document.querySelector('[data-grp="'+t+'"]');
      if(nav){nav.textContent=TYPES[t]+' ('+n+')';}
    });
  }

  /* raggi delle ruote negli SVG */
  function spokes(){
    var NS='http://www.w3.org/2000/svg';
    [].forEach.call(document.querySelectorAll('.spk'),function(g){
      var p=g.getAttribute('data-c').split(',').map(Number),cx=p[0],cy=p[1],r=p[2],n=p[3],d='';
      for(var i=0;i<n;i++){var a=i*Math.PI*2/n;d+='M'+cx+' '+cy+'L'+(cx+r*Math.cos(a)).toFixed(1)+' '+(cy+r*Math.sin(a)).toFixed(1);}
      var pa=document.createElementNS(NS,'path');pa.setAttribute('d',d);pa.setAttribute('class','ln');pa.style.strokeWidth='.8';g.appendChild(pa);
    });
  }

  /* indice interno alla scheda */
  function toc(){
    [].forEach.call(document.querySelectorAll('[data-go]'),function(b){
      b.addEventListener('click',function(){var t=document.getElementById(b.getAttribute('data-go'));if(t){t.scrollIntoView({behavior:'smooth',block:'start'});}});
    });
  }

  function init(){
    chrome();spokes();toc();
    A.ready(function(){refs();home();footState();});
    pump();
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}else{init();}
})();
