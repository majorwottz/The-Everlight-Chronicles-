const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('on')}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

const nav=document.querySelector('.nav');
const menu=document.querySelector('.menu');
const setMenu=(open)=>{nav.classList.toggle('open',open);menu.setAttribute('aria-expanded',open?'true':'false');menu.textContent=open?'×':'☰';menu.setAttribute('aria-label',open?'Close menu':'Open menu');};
menu.onclick=()=>setMenu(!nav.classList.contains('open'));
document.querySelectorAll('.nav nav a').forEach(a=>a.onclick=()=>setMenu(false));
document.addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});
document.addEventListener('click',e=>{if(nav.classList.contains('open')&&!nav.contains(e.target))setMenu(false)});

// subtle hero parallax
const heroBg=document.querySelector('.hero-bg');
window.addEventListener('scroll',()=>{
  const y=Math.min(window.scrollY,900);
  heroBg.style.translate=`0 ${y*.08}px`;
});

// Kingdom explorer
const realmTitle=document.querySelector('#realm-title');
const realmDesc=document.querySelector('#realm-desc');
const realmAura=document.querySelector('.core');
document.querySelectorAll('.map-pin,.realm-ring button').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('.map-pin,.realm-ring button').forEach(x=>x.classList.remove('active'));
  b.classList.add('active');
  if(realmTitle) realmTitle.textContent=b.dataset.r;
  if(realmDesc) realmDesc.textContent=b.dataset.d;
  const virtue=document.querySelector('#realm-virtue'); if(virtue) virtue.textContent=(b.dataset.v||'KINGDOM VIRTUE').toUpperCase();
  if(realmAura){realmAura.classList.remove('pulse'); void realmAura.offsetWidth; realmAura.classList.add('pulse');}
});

// multi-question keeper quiz
const questions=[
  {q:'When someone is in trouble, what do you do first?',a:[['kai','Step forward, even if I’m afraid.'],['zemi','Find out what is really happening.'],['finn','Help them believe things can get better.'],['lila','Stay close so they are not alone.']]},
  {q:'Which challenge would test you most?',a:[['zemi','Sorting truth from a convincing lie.'],['lila','Choosing kindness when I am hurt.'],['kai','Doing the right thing when I am scared.'],['finn','Holding on when everything feels lost.']]},
  {q:'What strength do friends count on from you?',a:[['finn','I keep people going.'],['kai','I protect and take action.'],['lila','I notice what others are feeling.'],['zemi','I ask the questions others miss.']]}
];
const results={
  kai:['KAI VALE','COURAGE','Your flame is Courage. You move toward what is right even when fear is present.','AUREON · THE FLAMEHEARTED'],
  zemi:['ZEMI','TRUTH','Your flame is Truth. You seek what is real, test appearances, and refuse easy answers.','ORIN · THE ALLSEEING'],
  finn:['FINN','HOPE','Your flame is Hope. You help others keep walking when the road grows dark.','DURAN · THE ENDURING'],
  lila:['LILA','COMPASSION','Your flame is Compassion. You see the hurting and refuse to leave them behind.','ELARION · GUARDIAN OF COMPASSION']
};
let step=0,scores={kai:0,zemi:0,finn:0,lila:0};
function renderQuiz(){
 const body=document.querySelector('#quiz-body'); const item=questions[step];
 body.innerHTML=`<div class="quiz-progress"><i style="width:${((step+1)/questions.length)*100}%"></i></div><p class="question">${item.q}</p><div class="answers">${item.a.map(([v,t])=>`<button data-v="${v}">${t}</button>`).join('')}</div>`;
 body.querySelectorAll('button').forEach(b=>b.onclick=()=>{scores[b.dataset.v]++;step++; if(step<questions.length)renderQuiz(); else showResult();});
}
function showResult(){
 const win=Object.entries(scores).sort((a,b)=>b[1]-a[1])[0][0],r=results[win];
 document.querySelector('#quiz-body').hidden=true;
 const o=document.querySelector('#quiz-result'); o.hidden=false;
 o.innerHTML=`<div class="result-flame">✦</div><p class="eyebrow">YOUR FLAME</p><h2>${r[0]}</h2><h3>${r[1]}</h3><p>${r[2]}</p><strong>${r[3]}</strong><br><button class="btn ghost" id="again" style="margin-top:24px">Take Again</button>`;
 document.querySelector('#again').onclick=()=>{step=0;scores={kai:0,zemi:0,finn:0,lila:0};o.hidden=true;document.querySelector('#quiz-body').hidden=false;renderQuiz();};
}
renderQuiz();


// hidden flame discovery
let found=0;
const secret=document.querySelector('#secretStatus');
document.querySelectorAll('.hidden-flame').forEach(f=>f.onclick=()=>{
 if(f.classList.contains('found')) return;
 f.classList.add('found'); found++;
 secret.textContent=`${found} of 4 hidden flames found`;
 if(found===4){
  secret.innerHTML='<strong>All Four Flames Found.</strong> You uncovered a hidden message: “The Light does not hide. The Light sends.”';
  document.querySelector('#secretLore').classList.add('show');
 }
});

// keep CTA glow alive
setInterval(()=>{document.querySelectorAll('.btn.gold').forEach(b=>{b.classList.toggle('alive')})},2400);

// top scroll progress: subtle orientation for long-form storytelling
const progress=document.querySelector('#scrollProgress');
window.addEventListener('scroll',()=>{
  const max=document.documentElement.scrollHeight-window.innerHeight;
  progress.style.width=(max?Math.min(100,(window.scrollY/max)*100):0)+'%';
},{passive:true});

// small depth response on premium cards (desktop only)
if(window.matchMedia('(pointer:fine)').matches){
 document.querySelectorAll('.product-card,.keeper').forEach(card=>{
  card.addEventListener('mousemove',e=>{
   const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
   card.style.transform=`perspective(800px) rotateX(${(-y*2.4).toFixed(2)}deg) rotateY(${(x*2.8).toFixed(2)}deg) translateY(-3px)`;
  });
  card.addEventListener('mouseleave',()=>card.style.transform='');
 });
}

// Soundtrack teaser launches the persistent theme player.
document.querySelectorAll('[data-main-music-play]').forEach(button=>button.addEventListener('click',()=>{const toggle=document.querySelector('[data-music-toggle]');if(toggle){toggle.click();document.getElementById('musicPlayer')?.classList.remove('collapsed');}}));
