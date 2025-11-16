
(function () {
  const skillSection = document.getElementById('skill');
  if (!skillSection) return;


  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function animateNumber(el, to, duration = 800, delay = 0) {
    if (!el) return;
    const start = performance.now() + delay;
    const from = 0;
    function step(now) {
      if (now < start) { requestAnimationFrame(step); return; }
      const t = Math.min(1, (now - start) / duration);
      const eased = easeOutCubic(t);
      const cur = Math.round(from + (to - from) * eased);
      el.textContent = cur + '%';
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }


  function readPct(bar) {
    const raw = bar.getAttribute('data-percent') || '0';
    const n = parseInt(raw, 10);
    if (Number.isNaN(n)) return 0;
    return Math.min(100, Math.max(0, n));
  }

 
  function getThemeVars() {
    const s = getComputedStyle(document.documentElement);
    const text = s.getPropertyValue('--text')?.trim() || s.getPropertyValue('color')?.trim() || '#111';
    const muted = s.getPropertyValue('--muted')?.trim() || '#6b7280';
    const accent = s.getPropertyValue('--accent')?.trim() || '#4f46e5';
    const bg = s.getPropertyValue('--bg')?.trim() || '#fff';
   
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)';
    const angleColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)';
    return { text, muted, accent, bg, isDark, gridColor, angleColor };
  }

  
  let barsAnimated = false;
  function animateSkillBarsOnce() {
    if (barsAnimated) return;
    const bars = skillSection.querySelectorAll('.skill-bar');
    bars.forEach((bar, i) => {
      const fill = bar.querySelector('.skill-fill');
      const percentEl = bar.parentElement.querySelector('.skill-percent');
      const pct = readPct(bar);
      const delay = i * 120;
  
      setTimeout(() => {
        if (fill) {
          fill.style.transition = 'width 900ms cubic-bezier(.2,.9,.3,1)';
          fill.style.width = pct + '%';
        }
      }, delay);
     
      animateNumber(percentEl, pct, 900, delay);
    });
    barsAnimated = true;
  }


  let _attempts = 0;
  const MAX_ATTEMPTS = 12; 


  function drawSkillChart() {
    const canvas = document.getElementById('skillChart');
    if (!canvas) return;
    if (typeof Chart === 'undefined') {
 
      if (_attempts < MAX_ATTEMPTS) {
        _attempts++;
        setTimeout(drawSkillChart, 500);
      } else {
        console.warn('Chart.js not available after retries.');
      }
      return;
    }

    const ctx = canvas.getContext('2d');

    const labels = [
      'Bahasa Pemrograman', 
      'Skill Editing',      
      'Rebahan',            
      'Skill Game'         
    ];
    const dataVals = [
      45,  
      34,  
      100, 
      42   
    ];

    
    const vars = getThemeVars();
    const textColor = vars.text || '#111';
    const gridColor = vars.gridColor;
    const angleColor = vars.angleColor;
    const accent = vars.accent || '#4f46e5';
    const pointColor = getComputedStyle(document.documentElement).getPropertyValue('--point')?.trim() || '#06b6d4';

   
    if (window._skillChartInstance) {
      try { window._skillChartInstance.destroy(); } catch (e) {  }
    }

    window._skillChartInstance = new Chart(ctx, {
      type: 'radar',
      data: {
        labels,
        datasets: [{
          label: 'Skill level',
          data: dataVals,
          backgroundColor: 'rgba(79,70,229,0.12)', 
          borderColor: accent,
          pointBackgroundColor: pointColor || '#06b6d4',
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
              color: textColor
            },
            grid: { color: gridColor },
            angleLines: { color: angleColor },
            pointLabels: { color: textColor, font: { size: 13 } }
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

 
  function updateSkillChartColors() {
    if (!window._skillChartInstance) return;
    const vars = getThemeVars();
    const textColor = vars.text;
    const gridColor = vars.gridColor;
    const angleColor = vars.angleColor;
    const accent = vars.accent || '#4f46e5';
    const pointColor = getComputedStyle(document.documentElement).getPropertyValue('--point')?.trim() || '#06b6d4';

    const chart = window._skillChartInstance;
  
    if (chart.data && chart.data.datasets && chart.data.datasets[0]) {
      chart.data.datasets[0].borderColor = accent;
      chart.data.datasets[0].backgroundColor = 'rgba(79,70,229,0.12)';
      chart.data.datasets[0].pointBackgroundColor = pointColor;
    }
    
    if (chart.options && chart.options.scales && chart.options.scales.r) {
      chart.options.scales.r.ticks.color = textColor;
      chart.options.scales.r.grid.color = gridColor;
      chart.options.scales.r.angleLines.color = angleColor;
      chart.options.scales.r.pointLabels.color = textColor;
    }

    try { chart.update(); } catch (e) {  }
  }

  
  const htmlEl = document.documentElement;
  const themeObserver = new MutationObserver(muts => {
    for (const m of muts) {
      if (m.type === 'attributes' && m.attributeName === 'data-theme') {
        
        updateSkillChartColors();
      }
    }
  });
  themeObserver.observe(htmlEl, { attributes: true });

  
  let animatedOnce = false;
  const mo = new MutationObserver(muts => {
    muts.forEach(m => {
      if (m.attributeName === 'class' && skillSection.classList.contains('active')) {
        if (!animatedOnce) {
          animateSkillBarsOnce();
          drawSkillChart();
          animatedOnce = true;
        } else {
         
          if (!window._skillChartInstance) drawSkillChart();
        }
      }
    });
  });
  mo.observe(skillSection, { attributes: true });

 
  if (skillSection.classList.contains('active')) {
    animateSkillBarsOnce();
    drawSkillChart();
    animatedOnce = true;
  }


  window.addEventListener('resize', () => {
    if (window._skillChartInstance) {
      try { window._skillChartInstance.resize(); } catch (e) {}
    }
  });

 
  window._refreshSkillChart = function () { drawSkillChart(); updateSkillChartColors(); };

})();
