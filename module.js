function triggerLoveRain(count = 12, duration = 4000){
  if(!loveRain) return;
  const hearts = [];
  const startTime = performance.now();

  for(let i=0;i<count;i++){
    const h = document.createElement('span');
    h.className = 'heart';
    h.textContent = '❤'; // bisa diganti emoji lain atau SVG
    // random horizontal start inside card width (10%..90%)
    const left = 10 + Math.random()*80; // persen relatif
    // small vertical offset near top of avatar area
    const top = 10 + Math.random()*25; // persen
    h.style.left = left + '%';
    h.style.top = top + '%';

    // random horizontal sway amount: between -60px and 60px
    const sway = (Math.random()*120 - 60) + 'px';
    h.style.setProperty('--sx', sway);

    // random animation duration so hearts don't look identical
    const animDur = (1.2 + Math.random()*1.8).toFixed(2) + 's';
    h.style.animation = `heartFall ${animDur} cubic-bezier(.2,.9,.3,1) forwards`;
    // small stagger via animationDelay
    h.style.animationDelay = (Math.random()*0.6) + 's';

    loveRain.appendChild(h);
    hearts.push(h);
  }

  // Hapus hati setelah (duration + 1200ms) agar anim selesai
  setTimeout(()=>{
    hearts.forEach(h => {
      if(h && h.parentNode) h.parentNode.removeChild(h);
    });
  }, duration + 1200);
}

// module.js — non-exporting module that runs on load
// Features: particle cursor, animated title, scroll reveal, mood widget, easter egg, music toggle

// ---------- Particle cursor ----------
(function(){
  const container = document.getElementById('particles');
  if(!container) return;
  let last = 0;
  window.addEventListener('mousemove', (e) => {
    const now = performance.now();
    // limit particle spawn rate
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
    // remove after animation
    setTimeout(()=> p.remove(), 900);
  });
})();

// ---------- Animated title (per-letter) ----------
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
    // stagger
    setTimeout(()=> span.style.opacity = '1' , 100 + i*35);
    setTimeout(()=> span.style.transform = 'translateY(0)', 150 + i*35);
  });
  setTimeout(()=> title.classList.add('revealed'), 120);
})();

// ---------- Intersection observer: scroll reveal ----------
(function(){
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(en => {
      if(en.isIntersecting) {
        en.target.classList.add('in');
        // if you want animate only once:
        obs.unobserve(en.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('[data-animate]').forEach(el => obs.observe(el));
})();

// ---------- Mood widget ----------
(function(){
  const widget = document.getElementById('moodWidget');
  if(!widget) return;
  const feedback = document.getElementById('moodFeedback');
  widget.addEventListener('click', (e) => {
    const btn = e.target.closest('.mood-btn');
    if(!btn) return;
    const mood = btn.dataset.mood;
    // save to localStorage
    try { localStorage.setItem('userMood', mood); } catch(e){}
    // feedback
    feedback.textContent = `Kamu memilih: ${mood}`;
    feedback.classList.add('celebrate');
    setTimeout(()=> feedback.classList.remove('celebrate'), 1200);
    // small celebration: particle emojis
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
  // restore if exists
  const stored = localStorage.getItem('userMood');
  if(stored) {
    const fb = document.getElementById('moodFeedback');
    if(fb) fb.textContent = `Terakhir memilih: ${stored}`;
  }
})();

// ---------- Easter egg: click avatar fast 5x toggles secret mode ----------
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
      // small confetti hearts:
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
      // small toast
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

// ---------- Background music toggle ----------
(function(){
  const btn = document.getElementById('musicToggle');
  if(!btn) return;
  // create audio element (user: replace src with own file if desired)
  const audio = document.createElement('audio');
  audio.loop = true;
  audio.preload = 'auto';
  // DEFAULT: not set. Replace with your music URL or leave empty for silence.
  // audio.src = './assets/music.mp3';
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
        // autoplay blocked: show hint to user to interact then press again
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

  // resume music if user previously enabled (persist state)
  const saved = localStorage.getItem('bgMusicPlaying');
  if(saved === 'true'){
    // user must interact to allow audio on some browsers
    // we set button state only
    btn.textContent = '⏸';
    btn.setAttribute('aria-pressed','true');
    playing = true;
  }
})();

