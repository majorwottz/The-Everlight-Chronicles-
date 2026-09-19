(() => {
  const audio=document.getElementById('teaserAudio');
  const cards=[...document.querySelectorAll('[data-track-card]')];
  const now=document.getElementById('teaserNowPlaying');
  const seek=document.getElementById('teaserSeek');
  const elapsed=document.getElementById('teaserElapsed');
  const duration=document.getElementById('teaserDuration');
  const fmt=s=>`${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2,'0')}`;
  let active=null;
  cards.forEach(card=>{const btn=card.querySelector('.track-play');btn.addEventListener('click',async()=>{
    if(active===card&&!audio.paused){audio.pause();return;}
    cards.forEach(c=>{c.classList.remove('playing');c.querySelector('.track-play').textContent='▶';});
    active=card; audio.src=btn.dataset.src; now.querySelector('span').textContent='NOW PLAYING · TEASER'; now.querySelector('b').textContent=btn.dataset.title;
    try{await audio.play();}catch(e){}
  });});
  audio.addEventListener('play',()=>{if(active){active.classList.add('playing');active.querySelector('.track-play').textContent='❚❚';}});
  audio.addEventListener('pause',()=>{if(active)active.querySelector('.track-play').textContent='▶';});
  audio.addEventListener('loadedmetadata',()=>duration.textContent=fmt(audio.duration));
  audio.addEventListener('timeupdate',()=>{elapsed.textContent=fmt(audio.currentTime);seek.value=audio.duration?audio.currentTime/audio.duration*100:0;});
  audio.addEventListener('ended',()=>{if(active){active.classList.remove('playing');active.querySelector('.track-play').textContent='▶';}});
  seek.addEventListener('input',()=>{if(audio.duration)audio.currentTime=Number(seek.value)*audio.duration/100;});
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('on')}),{threshold:.1});document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
  const menu=document.querySelector('.menu'),nav=document.querySelector('.nav');
  const setMenu=(open)=>{if(!menu||!nav)return;nav.classList.toggle('open',open);menu.setAttribute('aria-expanded',open?'true':'false');menu.textContent=open?'×':'☰';menu.setAttribute('aria-label',open?'Close menu':'Open menu');};
  menu?.addEventListener('click',()=>setMenu(!nav.classList.contains('open')));
  document.querySelectorAll('.nav nav a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});
})();