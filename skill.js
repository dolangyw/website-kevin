/* --- Skill bars animation --- */
(function(){
  const skillSection = document.getElementById('skill');
  if(!skillSection) return;

  let animated = false;

  function animateSkillBars(){
    if(animated) return;
    const bars = skillSection.querySelectorAll('.skill-bar');
    bars.forEach((bar, i) => {
      const fill = bar.querySelector('.skill-fill');
      const percentEl = bar.parentElement.querySelector('.skill-percent');
      const pct = parseInt(bar.getAttribute('data-percent') || '0', 10);
      // stagger delay (ms)
      const delay = i * 120;

      // schedule actual width change (CSS transition)
      setTimeout(()=> {
        if(fill) fill.style.width = pct + '%';
      }, delay);

      // number animation (0 -> pct)
      animateNumber(percentEl, pct, 900, delay);
    });

    animated = true;
  }

  // animate number with requestAnimationFrame
  function animateNumber(el, to, duration = 800, startDelay = 0){
    if(!el) return;
    const start = performance.now() + startDelay;
    const from = 0;
    function step(now){
      const elapsed = now - start;
      if(elapsed < 0){
        requestAnimationFrame(step);
        return;
      }
      const t = Math.min(1, elapsed / duration);
      const eased = easeOutCubic(t);
      const current = Math.round(from + (to - from) * eased);
      el.textContent = current + '%';
      if(t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }

  // observe class changes on the skill section (active toggled by showPage)
  const mo = new MutationObserver(muts => {
    muts.forEach(m => {
      if(m.attributeName === 'class'){
        if(skillSection.classList.contains('active')) {
          animateSkillBars();
        }
      }
    });
  });
  mo.observe(skillSection, { attributes: true });

  // if page already active on load, animate immediately
  if(skillSection.classList.contains('active')){
    setTimeout(animateSkillBars, 250);
  }
})();

// skill.js — animate skill bars + draw radar chart using Chart.js
(function(){
  const skillSection = document.getElementById('skill');
  if(!skillSection) return;

  // Animate bars when section active or scrolled into view
  function animateSkillBars(){
    const bars = skillSection.querySelectorAll('.skill-bar');
    bars.forEach((bar, i) => {
      const fill = bar.querySelector('.skill-fill');
      const pct = Math.min(100, parseInt(bar.getAttribute('data-percent') || '0', 10));
      setTimeout(()=> {
        fill.style.width = pct + '%';
      }, i * 120);
      // percent number
      const percentEl = bar.parentElement.querySelector('.skill-percent');
      if(percentEl){
        animateNumber(percentEl, pct, 900, i * 120);
      }
    });
  }

  function animateNumber(el, to, duration = 800, delay = 0){
    const start = performance.now() + delay;
    const from = 0;
    function step(now){
      const t = Math.min(1, (now - start) / duration);
      if(now < start) { requestAnimationFrame(step); return; }
      const eased = 1 - Math.pow(1 - t, 3);
      const cur = Math.round(from + (to - from) * eased);
      el.textContent = cur + '%';
      if(t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // use MutationObserver: when skill section gets class active -> animate once
  let animated = false;
  const mo = new MutationObserver(muts => {
    muts.forEach(m => {
      if(m.attributeName === 'class' && skillSection.classList.contains('active')){
        if(!animated){ animateSkillBars(); drawSkillChart(); animated = true; }
      }
    });
  });
  mo.observe(skillSection, { attributes: true });

  // initial if already active
  if(skillSection.classList.contains('active')) { animateSkillBars(); drawSkillChart(); animated = true; }

  // ---------- Chart.js radar chart ----------
  function drawSkillChart(){
  const canvas = document.getElementById('skillChart');
  if(!canvas || !window.Chart) return;

  const ctx = canvas.getContext('2d');

  // Labels/data disusun supaya:
  // index 0 = atas, index 1 = kanan, index 2 = bawah, index 3 = kiri
  const labels = [
    'Bahasa Pemrograman', // atas
    'Skill Editing',      // kanan
    'Rebahan',            // bawah
    'Skill Game'          // kiri
  ];
  const dataVals = [
    45,  // Bahasa Pemrograman (atas)
    34,  // Skill Editing (kanan)
    100, // Rebahan (bawah)
    42   // Skill Game (kiri)
  ];

  // destroy existing chart if present
  if(window._skillChartInstance){
    try { window._skillChartInstance.destroy(); } catch(e){}
  }

  window._skillChartInstance = new Chart(ctx, {
    type: 'radar',
    data: {
      labels,
      datasets: [{
        label: 'Skill level',
        data: dataVals,
        backgroundColor: 'rgba(79,70,229,0.16)',
        borderColor: '#4f46e5',
        pointBackgroundColor: '#06b6d4',
        borderWidth: 2,
        pointRadius: 5,
        fill: true,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          beginAtZero: true,
          suggestedMax: 100,
          ticks: {
            stepSize: 100,
            color: getComputedStyle(document.body).color
          },
          grid: { color: 'rgba(0,0,0,0.06)' },
          angleLines: { color: 'rgba(0,0,0,0.06)' },
          pointLabels: { color: getComputedStyle(document.body).color, font: { size: 13 } }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true }
      },
      animation: { duration: 1000, easing: 'easeOutQuart' }
    }
  });
}


})();
