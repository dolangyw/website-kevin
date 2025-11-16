function triggerLoveRain() {
    const loveRainContainer = document.getElementById('loveRain');
    if (!loveRainContainer) return;
    
    loveRainContainer.setAttribute('aria-hidden', 'false');

    for (let i = 0; i < 50; i++) {
        const heart = document.createElement('div');
        heart.classList.add('heart');
        heart.innerHTML = '❤️';
        
        const startX = Math.random() * window.innerWidth;
        const duration = 2000 + Math.random() * 2000;
        const scale = 0.5 + Math.random() * 1;
        
        loveRainContainer.appendChild(heart);

        anime({
            targets: heart,
            translateX: startX,
            translateY: ['-50px', window.innerHeight + 50],
            rotate: '2turn',
            scale: scale,
            duration: duration,
            easing: 'linear',
            delay: Math.random() * 1500,
            complete: (anim) => {
                heart.remove();
                if (loveRainContainer.children.length === 0) {
                     loveRainContainer.setAttribute('aria-hidden', 'true');
                }
            }
        });
    }
}


(function(){
  const container = document.getElementById('particles');
  if(!container) return;
  let last = 0;
  window.addEventListener('mousemove', (e) => {
    const now = performance.now();
    if(now - last < 16) return;
    last = now;
    const p = document.createElement('div');
    p.className = 'particle';
    const size = 6 + Math.random()*8;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.left = e.clientX + 'px';
    p.style.top = e.clientY + 'px';
    p.style.background = `hsl(${220 + Math.random()*60}, 85%, 60%)`;
    container.appendChild(p);
    setTimeout(()=> p.remove(), 900);
  });
})();


(function(){
  const title = document.getElementById('animatedTitle');
  if(!title) return;
  const txt = title.textContent.trim();
  title.textContent = '';
  txt.split('').forEach((ch, i) => {
    const span = document.createElement('span');
    span.className = 'char';
    span.textContent = ch;
    title.appendChild(span);
    setTimeout(()=> span.style.opacity = '1' , 100 + i*35);
    setTimeout(()=> span.style.transform = 'translateY(0)', 150 + i*35);
  });
  setTimeout(()=> title.classList.add('revealed'), 120);
})();


(function(){
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(en => {
      if(en.isIntersecting) {
        en.target.classList.add('in');
        obs.unobserve(en.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('[data-animate]').forEach(el => obs.observe(el));
})();


(function(){
  const widget = document.getElementById('moodWidget');
  if(!widget) return;
  const feedback = document.getElementById('moodFeedback');
  widget.addEventListener('click', (e) => {
    const btn = e.target.closest('.mood-btn');
    if(!btn) return;
    const mood = btn.dataset.mood;
    try { localStorage.setItem('userMood', mood); } catch(e){}
    feedback.textContent = `Kamu memilih: ${mood}`;
    feedback.classList.add('celebrate');
    setTimeout(()=> feedback.classList.remove('celebrate'), 1200);
    for(let i=0;i<12;i++){
      const el = document.createElement('div');
      el.className = 'particle';
      el.style.left = (50 + (Math.random()-0.5)*40) + '%';
      el.style.top = (40 + Math.random()*20) + '%';
      el.style.width = '12px';
      el.style.height = '12px';
      el.style.background = 'transparent';
      el.style.fontSize = '14px';
      el.textContent = i%2? '✨' : '💫';
      el.style.pointerEvents = 'none';
      document.getElementById('particles').appendChild(el);
      setTimeout(()=> el.remove(), 900);
    }
  });
  const stored = localStorage.getItem('userMood');
  if(stored) {
    const fb = document.getElementById('moodFeedback');
    if(fb) fb.textContent = `Terakhir memilih: ${stored}`;
  }
})();


(function(){
  const frontAvatar = document.getElementById('frontAvatar');
  if(!frontAvatar) return;
  let clicks = 0;
  let timer = null;
  frontAvatar.addEventListener('click', (e) => {
    clicks++;
    if(timer) clearTimeout(timer);
    timer = setTimeout(()=> { clicks = 0; }, 1200);
    if(clicks >= 5){
      clicks = 0;
      document.body.classList.toggle('easter');
      const particles = document.getElementById('particles');
      for(let i=0;i<30;i++){
        const el = document.createElement('div');
        el.className = 'particle';
        el.style.width = '10px';
        el.style.height = '10px';
        el.style.left = (e.clientX + (Math.random()-0.5)*160) + 'px';
        el.style.top = (e.clientY + (Math.random()-0.5)*160) + 'px';
        el.style.background = `hsl(${Math.random()*360},80%,60%)`;
        particles.appendChild(el);
        setTimeout(()=> el.remove(), 1200);
      }
      const toast = document.createElement('div');
      toast.textContent = 'Easter egg ditemukan!';
      toast.style.position = 'fixed';
      toast.style.right = '18px';
      toast.style.top = '18px';
      toast.style.padding = '10px 14px';
      toast.style.borderRadius = '8px';
      toast.style.zIndex = 99999;
      toast.style.background = '#111';
      toast.style.color = '#fff';
      document.body.appendChild(toast);
      setTimeout(()=> toast.remove(), 2200);
    }
  });
})();


(function(){
  const btn = document.getElementById('musicToggle');
  if(!btn) return;
  const audio = document.createElement('audio');
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = 0.18;
  let playing = false;

  btn.addEventListener('click', async () => {
    if(!playing){
      try {
        await audio.play();
        playing = true;
        btn.textContent = '⏸';
        btn.setAttribute('aria-pressed','true');
      } catch(e){
        btn.textContent = '♪';
        btn.setAttribute('aria-pressed','false');
        alert('Klik dulu halaman (interaksi) lalu coba tombol musik lagi untuk memutar. Browser biasanya memblokir autoplay.');
      }
    } else {
      audio.pause();
      playing = false;
      btn.textContent = '♪';
      btn.setAttribute('aria-pressed','false');
    }
  });

  const saved = localStorage.getItem('bgMusicPlaying');
  if(saved === 'true'){
    btn.textContent = '⏸';
    btn.setAttribute('aria-pressed','true');
    playing = true;
  }
})();


(function(){
  const overlay = document.getElementById('loadingOverlay');
  const fill = document.getElementById('loadingFill');
  const percent = document.getElementById('loadingPercent');
  let simulated = 0;
  function tickLoad(){
    simulated = Math.min(98, simulated + Math.random()*8);
    if(fill) fill.style.width = simulated + '%';
    if(percent) percent.textContent = Math.floor(simulated) + '%';
    if(simulated < 98) setTimeout(tickLoad, 200);
  }
  if(overlay){ tickLoad(); window.addEventListener('load', ()=> {
      if(fill) fill.style.width = '100%';
      if(percent) percent.textContent = '100%';
      setTimeout(()=> { overlay.style.transition='opacity .45s'; overlay.style.opacity=0; setTimeout(()=> overlay.remove(),100); }, 250);
      if(typeof awardBadge === 'function') awardBadge('first_load','First Load');
  });}

  const timelineItems = document.querySelectorAll('#timeline .timeline-item');
  if(timelineItems.length){
    const io = new IntersectionObserver(entries=>{
      entries.forEach(en=>{
        if(en.isIntersecting){
          en.target.classList.add('in');
          io.unobserve(en.target);
          if(typeof awardBadge === 'function') awardBadge('timeline_explorer','Explorer');
        }
      });
    },{threshold:0.18});
    timelineItems.forEach(it=> io.observe(it));
  }

  const openStories = document.getElementById('openStories');
  const storyViewer = document.getElementById('storyViewer');
  const storySlides = document.getElementById('storySlides');
  const storyProgress = document.getElementById('storyProgress');
  const storyPrev = document.getElementById('storyPrev');
  const storyNext = document.getElementById('storyNext');
  const storyClose = document.getElementById('storyClose');
  let currentSlide = 0, storyTimer = null;

  function showStoryViewer(show=true){
    if(!storyViewer) return;
    if(show){
      storyViewer.classList.add('show');
      storyViewer.setAttribute('aria-hidden','false');
      startStory(0);
    } else {
      storyViewer.classList.remove('show');
      storyViewer.setAttribute('aria-hidden','true');
      stopStory();
    }
  }

  function startStory(idx){
    stopStory();
    const slides = storySlides.querySelectorAll('.story-slide');
    if(!slides.length) return;
    currentSlide = Math.max(0, Math.min(idx, slides.length-1));
    slides.forEach((s,i)=> s.classList.toggle('active', i===currentSlide));
    const bar = storyProgress.querySelector('#storyProgressBar');
    const dur = parseInt(slides[currentSlide].dataset.duration) || 3500;
    const progInner = storyProgress.querySelector('i') || (function(){
      const iel = document.createElement('i'); storyProgress.appendChild(iel); return iel;
    })();
    progInner.style.width = '0%';
    if(typeof awardBadge === 'function') awardBadge('story_watcher','Story Watcher');
    const start = performance.now();
    function step(now){
      const t = Math.min(1, (now - start) / dur);
      progInner.style.width = (t*100) + '%';
      if(t < 1) storyTimer = requestAnimationFrame(step);
      else {
        if(currentSlide < slides.length -1) startStory(currentSlide + 1);
        else { }
      }
    }
    storyTimer = requestAnimationFrame(step);
  }
  function stopStory(){ if(storyTimer) cancelAnimationFrame(storyTimer); storyTimer = null; const prog = storyProgress.querySelector('i'); if(prog) prog.style.width='0%'; }
  if(openStories) openStories.addEventListener('click', ()=> showStoryViewer(true));
  if(storyClose) storyClose.addEventListener('click', ()=> showStoryViewer(false));
  if(storyNext) storyNext.addEventListener('click', ()=> startStory(currentSlide+1));
  if(storyPrev) storyPrev.addEventListener('click', ()=> startStory(currentSlide-1));

  const pet = document.getElementById('floatingPet');
  if(pet){
    pet.addEventListener('click', (e)=> {
      pet.animate([{ transform:'translateY(0)' }, { transform:'translateY(-8px)' }, { transform:'translateY(0)'}], { duration:320, easing:'ease-out' });
      const sfx = document.getElementById('sfxUwu');
      if(sfx){ sfx.currentTime = 0; sfx.play().catch(()=>{}); }
      if(typeof awardBadge === 'function') awardBadge('pet_friend','Pet Friend');
    });

    let dragging = false, offset = {x:0,y:0};
    pet.addEventListener('pointerdown', (e)=>{
      dragging = true; pet.classList.add('dragging'); offset.x = e.clientX - pet.getBoundingClientRect().left; offset.y = e.clientY - pet.getBoundingClientRect().top;
      pet.setPointerCapture(e.pointerId);
    });
    pet.addEventListener('pointermove', (e)=>{
      if(!dragging) return;
      const x = e.clientX - offset.x, y = e.clientY - offset.y;
      pet.style.left = Math.max(8, Math.min(window.innerWidth - pet.offsetWidth - 8, x)) + 'px';
      pet.style.top = Math.max(8, Math.min(window.innerHeight - pet.offsetHeight - 8, y)) + 'px';
    });
    pet.addEventListener('pointerup', (e)=>{
      dragging = false; pet.classList.remove('dragging');
      try { pet.releasePointerCapture(e.pointerId); } catch(e){}
    });
  }

  const sfxUwu = document.getElementById('sfxUwu');
  document.querySelectorAll('.nav-link').forEach(a=>{
    a.addEventListener('click', ()=>{
      if(sfxUwu){ sfxUwu.currentTime=0; sfxUwu.play().catch(()=>{}); }
      if(typeof awardBadge === 'function') awardBadge('explorer','Page Explorer');
    });
  });

  const badgeToast = document.getElementById('badgeToast');
  window.showBadgeToast = function(title){
    if(!badgeToast) return;
    badgeToast.textContent = `Badge unlocked: ${title}`;
    badgeToast.classList.add('show');
    setTimeout(()=> badgeToast.classList.remove('show'), 2800);
  };

  window._uiFeatures = { showStoryViewer, awardBadge };

})(); 
(function () {
    const audio = document.getElementById('bgMusic');
    if (!audio) return;

    function playMusicOnce() {
        audio.volume = 0.55;
        audio.play().catch(() => {});

        document.removeEventListener('click', playMusicOnce);
    }

    document.addEventListener('click', playMusicOnce, { once: true });
})();

const btn = document.getElementById("themeToggle");
const icon = document.getElementById("themeIcon");

const saved = localStorage.getItem("theme");
if (saved) {
  document.documentElement.setAttribute("data-theme", saved);
  icon.textContent = saved === "dark" ? "☀️" : "🌙";
}

btn.onclick = () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";

  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);

  icon.textContent = next === "dark" ? "☀️" : "🌙";

  btn.classList.add("animate");

  setTimeout(() => {
    btn.classList.remove("animate");
  }, 500);
};


(function(){
  const notifRoot = document.getElementById('topNotification');
  if(!notifRoot) return;

  notifRoot.innerHTML = `
    <div class="inner">
      <div class="notif-text">Gabung channel WhatsApp saya untuk update terbaru</div>
      <div class="notif-actions">
        <a id="notifJoin" class="btn" target="_blank" rel="noopener">Gabung WhatsApp</a>
        <button id="notifClose" class="btn ghost">Tutup</button>
      </div>
    </div>
  `;
  const joinUrl = 'https://chat.whatsapp.com/XXXXXXXXXXXX';
  const joinBtn = document.getElementById('notifJoin');
  const closeBtn = document.getElementById('notifClose');
  joinBtn.href = joinUrl;

  const SHOWN_KEY = 'whNotifShown';
  if(sessionStorage.getItem(SHOWN_KEY)) return;

  setTimeout(()=> {
    notifRoot.classList.add('show');
    notifRoot.classList.add('inner');
    sessionStorage.setItem(SHOWN_KEY, '1');
  }, 5000);

  closeBtn.addEventListener('click', ()=> {
    notifRoot.classList.remove('show');
  });

  joinBtn.addEventListener('click', ()=> {
    notifRoot.classList.remove('show');
  });
})();
