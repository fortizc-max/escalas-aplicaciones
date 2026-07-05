/* Motor genérico de calculadoras de escalas.
   Cada página define window.SCALE = {
     id, title, subtitle, cite, totalLabel, headnote,
     max (opcional; si no, se calcula), higherIsWorse (bool, informativo),
     items: [ {n, name, instr?, bi?:bool, options:[{v, d}]} ],
     bands: [ {min, max, label} ] (opcional, interpretación por rangos),
     footer: [ 'html', ... ]
   }
   y luego carga este script. */
(function(){
  const S=window.SCALE;
  const state={}; // name -> value(string); bilateral: name+'R' / name+'L'
  const fmt=x=>(Math.round(x*10)/10).toString().replace('.',',');

  // max total
  const itemMax=it=>Math.max(...it.options.map(o=>o.v));
  const MAX = S.max!=null ? S.max : S.items.reduce((a,it)=>a+itemMax(it),0);
  const N = S.items.length;

  document.title = S.title + ' — Calculadora';

  // ---- build skeleton ----
  const wrap=document.createElement('div'); wrap.className='wrap';
  wrap.innerHTML=`
    <a class="back" href="index.html">← Todas las escalas</a>
    <header>
      <h1>${S.title}</h1>
      <p class="sub">${S.subtitle||''}</p>
      ${S.cite?`<p class="cite">${S.cite}</p>`:''}
    </header>
    <div class="totbar"><div class="totin">
      <span class="totlabel">${S.totalLabel||'Total'}</span>
      <div class="totnum" id="tot">0<small> / ${fmt(MAX)}</small></div>
      <div class="prog"><div class="progfill" id="fill"></div></div>
      <span class="done" id="done">0 / ${N} ítems</span>
      <button class="btn" id="reset">Reiniciar</button>
      <button class="btn" id="print">Imprimir</button>
    </div></div>
    <main id="app"></main>
    <section class="result">
      <div class="rlabel">${S.totalLabel||'Puntuación total'}</div>
      <div class="big" id="rbig">0<small> / ${fmt(MAX)}</small></div>
      <div class="rnote" id="rnote">Seleccione los ${N} ítems para completar la evaluación.</div>
    </section>
    <footer id="foot"></footer>`;
  document.body.appendChild(wrap);

  const app=wrap.querySelector('#app');

  function optRow(name,o){
    const l=document.createElement('label'); l.className='opt';
    l.dataset.name=name; l.dataset.val=o.v;
    const r=document.createElement('input'); r.type='radio'; r.name=name; r.value=o.v;
    r.addEventListener('change',()=>{state[name]=String(o.v);recompute();markSel();});
    const p=document.createElement('span'); p.className='optp'; p.textContent=o.v;
    const t=document.createElement('span'); t.textContent=o.d;
    l.append(r,p,t); return l;
  }
  S.items.forEach(it=>{
    const card=document.createElement('section'); card.className='item';
    const h=document.createElement('div'); h.className='ihead';
    const num=document.createElement('span'); num.className='num'; num.textContent=it.n;
    const nm=document.createElement('span'); nm.className='iname'; nm.textContent=it.name;
    const rg=document.createElement('span'); rg.className='range';
    rg.textContent='0–'+itemMax(it)+(it.bi?' · bilateral':'');
    h.append(num,nm,rg); card.append(h);
    if(it.instr){const ins=document.createElement('p');ins.className='instr';ins.textContent=it.instr;card.append(ins);}
    if(!it.bi){
      const box=document.createElement('div'); box.className='opts';
      it.options.forEach(o=>box.append(optRow('i'+it.n,o)));
      card.append(box);
    } else {
      const grid=document.createElement('div'); grid.className='sides';
      [['R','Derecha'],['L','Izquierda']].forEach(([s,lab])=>{
        const col=document.createElement('div'); col.className='sidecol';
        const t=document.createElement('h4'); t.textContent=lab; col.append(t);
        const box=document.createElement('div'); box.className='opts';
        it.options.forEach(o=>box.append(optRow('i'+it.n+s,o)));
        col.append(box); grid.append(col);
      });
      card.append(grid);
      const m=document.createElement('div'); m.className='mean'; m.id='mean'+it.n;
      m.innerHTML='Media (D+I)/2: <b>—</b>'; card.append(m);
    }
    app.append(card);
  });

  // footer
  const foot=wrap.querySelector('#foot');
  (S.footer||[]).forEach(html=>{const p=document.createElement('p');p.innerHTML=html;foot.append(p);});
  const src=document.createElement('p');
  src.style.marginTop='10px';
  src.innerHTML='Material interactivo del libro <i>Pruebas clínicas, escalas e instrumentos de medida en rehabilitación</i>.';
  foot.append(src);

  function itemScore(it){
    if(!it.bi){const v=state['i'+it.n];return v===undefined?null:{val:+v,complete:true};}
    const R=state['i'+it.n+'R'],L=state['i'+it.n+'L'];
    const vals=[R,L].filter(x=>x!==undefined).map(Number);
    if(!vals.length) return null;
    return {val:vals.reduce((a,b)=>a+b,0)/vals.length, complete:vals.length===2};
  }
  function band(t){
    if(!S.bands) return '';
    const b=S.bands.find(b=>t>=b.min && t<=b.max);
    return b?' · '+b.label:'';
  }
  function recompute(){
    let tot=0,done=0;
    S.items.forEach(it=>{
      const s=itemScore(it);
      if(it.bi){const m=document.getElementById('mean'+it.n);
        m.innerHTML='Media (D+I)/2: <b>'+(s?fmt(s.val)+(s.complete?'':' (un lado)'):'—')+'</b>';}
      if(s){tot+=s.val; if(s.complete) done++;}
    });
    document.getElementById('tot').innerHTML=fmt(tot)+'<small> / '+fmt(MAX)+'</small>';
    document.getElementById('fill').style.width=(tot/MAX*100)+'%';
    document.getElementById('done').textContent=done+' / '+N+' ítems';
    document.getElementById('rbig').innerHTML=fmt(tot)+'<small> / '+fmt(MAX)+'</small>';
    const rnote=document.getElementById('rnote');
    if(done<N){ rnote.textContent='Evaluación incompleta: '+done+' de '+N+' ítems.'; }
    else { rnote.innerHTML='Evaluación completa ('+N+'/'+N+' ítems)'+band(tot)+'.'; }
  }
  function markSel(){
    document.querySelectorAll('label.opt').forEach(l=>{
      l.classList.toggle('sel', state[l.dataset.name]===l.dataset.val);
    });
  }
  wrap.querySelector('#reset').addEventListener('click',()=>{
    for(const k in state) delete state[k];
    document.querySelectorAll('input[type=radio]').forEach(r=>r.checked=false);
    markSel(); recompute();
  });
  wrap.querySelector('#print').addEventListener('click',()=>window.print());
  recompute();
})();
