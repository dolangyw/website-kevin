import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  query as dbQuery,
  orderByChild,
  serverTimestamp,
  update as dbUpdate
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";


const firebaseConfig = {
  apiKey: "AIzaSyA7q6vq96_5PxNkh2nKH8f6bwog5ZHEByU",
  authDomain: "dolang-b8265.firebaseapp.com",
  databaseURL: "https://dolang-b8265-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "dolang-b8265",
  storageBucket: "dolang-b8265.appspot.com",
  messagingSenderId: "512724829222",
  appId: "1:512724829222:web:a107494f456138759892e7",
  measurementId: "G-Y7LVBWV3PM"
};


let app;
let dbRT;
let commentsRef;
try {
  app = initializeApp(firebaseConfig);
  dbRT = getDatabase(app);
  commentsRef = ref(dbRT, 'comments');
  console.log("Firebase Realtime Database inisialisasi berhasil.");
} catch (err) {
  console.error("Gagal inisialisasi Firebase:", err);
}


const menuBtn = document.getElementById("menuBtn");
const drawer = document.getElementById("drawer");

if (menuBtn) menuBtn.addEventListener("click", () => {
  drawer.classList.toggle("open");
});


document.querySelectorAll(".nav-link").forEach(a => {
  a.onclick = e => {
    e.preventDefault();
    const page = a.dataset.page;
    showPage(page);
    drawer.classList.remove("open");
  };
});

function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const el = document.getElementById(id);
  if (el) el.classList.add("active");
}




const card = document.querySelector('.card');
const flipSound = document.getElementById('flipSound');

card.addEventListener('click', () => {
  card.classList.toggle('flipped');

  if (card.classList.contains('flipped')) {
    flipSound.currentTime = 0;
    flipSound.play();
  }
});



const commentsWrap = document.getElementById("commentsWrap");
const commentForm = document.getElementById("commentForm");
const authorInput = document.getElementById("authorInput");
const commentInput = document.getElementById("commentInput");
const sendBtn = document.getElementById("sendBtn");


function fmtTime(ts) {
  if (!ts) return "";

  if (typeof ts === 'number') return new Date(ts).toLocaleString();

  const n = Number(ts);
  if (!isNaN(n)) return new Date(n).toLocaleString();

  try {
    return new Date(ts).toLocaleString();
  } catch (e) {
    return "";
  }
}


function renderComment(data) {
  const card = document.createElement("div");
  card.className = "comment-card theme-comment";

  const authorEsc = escapeHtml(data.author || "Anon");
  const textEsc = escapeHtml(data.text || "");
  const timeStr = fmtTime(data.createdAt);

  card.innerHTML = `
    <div class="comment-avatar">
      <img src="https://api.dicebear.com/6.x/thumbs/svg?seed=${encodeURIComponent(authorEsc)}" alt="ava">
    </div>
    <div class="comment-body">
      <div class="comment-author">${authorEsc}</div>
      <div class="comment-time">${timeStr}</div>
      <div class="comment-text" style="color:var(--)">${textEsc}</div>
    </div>
  `;
  return card;
}


function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function(m) {
    return ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[m];
  });
}


try {
  const q = dbQuery(commentsRef, orderByChild('createdAt'));
  onValue(q, snapshot => {
    commentsWrap.innerHTML = "";
    const val = snapshot.val();
    if (!val) {

      const empty = document.createElement('div');
      empty.className = 'small-muted';
      empty.textContent = 'Belum ada komentar.';
      commentsWrap.appendChild(empty);
      return;
    }

    const arr = Object.keys(val).map(key => ({
      id: key,
      ...val[key]
    }));

    arr.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    arr.forEach(data => {
      const node = renderComment(data);
      commentsWrap.appendChild(node);
    });
  }, err => {
    console.error("Realtime onValue error:", err);
    commentsWrap.innerHTML = '<div class="small-muted">Error mengambil komentar. Cek console.</div>';
  });
} catch (err) {
  console.error("Error set listener Realtime DB:", err);
}


if (commentForm) {
  commentForm.onsubmit = async (e) => {
    e.preventDefault();
    const author = (authorInput?.value || "").trim();
    const text = (commentInput?.value || "").trim();

    if (!author || !text) {
      alert("Nama dan komentar harus diisi.");
      return;
    }

    try {
      sendBtn.disabled = true;

      await push(commentsRef, {
        author,
        text,
        createdAt: serverTimestamp()
      });
      commentInput.value = "";
    } catch (err) {
      console.error("Gagal kirim komentar ke Realtime DB:", err);
      alert("Gagal mengirim komentar. Cek console.");
    } finally {
      sendBtn.disabled = false;
    }
  };
}




(function() {

  if (typeof getDatabase === 'undefined' || typeof app === 'undefined') {
    console.warn('Dashboard: getDatabase atau app tidak tersedia — pastikan Firebase diinisialisasi sebelum kode ini.');
    return;
  }

  const db = getDatabase(app);
  const visitsRef = ref(db, 'analytics/visits');
  const commentsRefLocal = ref(db, 'comments');


  let visitorId = localStorage.getItem('visitorId');
  if (!visitorId) {
    visitorId = 'v_' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem('visitorId', visitorId);
  }

  let myVisitKey = null;
  (async function startVisit() {
    try {
      const pushed = await push(visitsRef, {
        visitorId,
        start: Date.now(),
        page: location.pathname + location.hash,
        ua: navigator.userAgent
      });
      myVisitKey = pushed.key;
    } catch (e) {
      console.error('startVisit failed', e);
    }
  })();


  function endVisit() {
    if (!myVisitKey) return;
    try {
      update(ref(db, `analytics/visits/${myVisitKey}`), {
        end: Date.now()
      });
    } catch (e) {}
  }
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') endVisit();
  });
  window.addEventListener('beforeunload', endVisit);


  const totalVisitsEl = document.getElementById('totalVisits');
  const todayVisitsEl = document.getElementById('todayVisits');
  const uniqueVisitorsEl = document.getElementById('uniqueVisitors');
  const avgSessionEl = document.getElementById('avgSession');
  const recentList = document.getElementById('recentList');
  const recentCommentsEl = document.getElementById('recentComments');
  const visitsChartCanvas = document.getElementById('visitsChart');

  function dayKey(ts) {
    const d = new Date(ts);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }


  onValue(visitsRef, snap => {
    const val = snap.val() || {};
    const keys = Object.keys(val || {});

    if (totalVisitsEl) totalVisitsEl.textContent = keys.length;


    if (uniqueVisitorsEl) {
      const uniq = new Set(keys.map(k => (val[k] && val[k].visitorId) || ''));
      uniqueVisitorsEl.textContent = uniq.size;
    }


    if (todayVisitsEl) {
      const today = dayKey(Date.now());
      const todayCount = keys.filter(k => {
        const item = val[k];
        return item && dayKey(item.start) === today;
      }).length;
      todayVisitsEl.textContent = todayCount;
    }


    if (avgSessionEl) {
      const durations = keys.map(k => {
        const it = val[k];
        return it && it.end ? (it.end - it.start) : 0;
      }).filter(n => n > 0);
      const avg = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length / 1000) : 0;
      avgSessionEl.textContent = avg;
    }


    if (recentList) {
      const arr = keys.map(k => ({
        id: k,
        ...val[k]
      })).sort((a, b) => (b.start || 0) - (a.start || 0)).slice(0, 10);
      recentList.innerHTML = '';
      if (!arr.length) recentList.innerHTML = '<li class="muted-small">Belum ada visit.</li>';
      arr.forEach(it => {
        const li = document.createElement('li');
        const when = it.start ? new Date(it.start).toLocaleString() : '-';
        li.textContent = `${when} — ${it.page || '-'} — ${it.visitorId || '-'}`;
        recentList.appendChild(li);
      });
    }


    const map = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      map[dayKey(d.getTime())] = 0;
    }
    keys.forEach(k => {
      const it = val[k];
      if (!it || !it.start) return;
      const dk = dayKey(it.start);
      if (map[dk] === undefined) map[dk] = 0;
      map[dk]++;
    });
    const labels = Object.keys(map);
    const data = labels.map(l => map[l]);


    if (visitsChartCanvas) {
      if (typeof Chart === 'undefined') {

        visitsChartCanvas.parentElement.querySelector('.panel-head').textContent = 'Visits (Chart.js belum dimuat)';
      } else {
        const ctx = visitsChartCanvas.getContext('2d');
        if (window._visitsChart) window._visitsChart.destroy();
        window._visitsChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: 'Visits',
              data,
              borderColor: '#4f46e5',
              backgroundColor: 'rgba(79,70,229,0.12)',
              tension: 0.25,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              x: {
                display: false
              }
            }
          }
        });
      }
    }
  }, err => {
    console.error('onValue visitsRef error', err);
    if (recentList) recentList.innerHTML = '<li class="muted-small">Error memuat data visits — cek console.</li>';
  });


  onValue(commentsRefLocal, snap => {
    const val = snap.val();
    if (!recentCommentsEl) return;
    if (!val) {
      recentCommentsEl.innerHTML = '<div class="muted-small">Belum ada komentar.</div>';
      return;
    }
    const arr = Object.keys(val).map(k => ({
      id: k,
      ...val[k]
    })).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 6);
    recentCommentsEl.innerHTML = '';
    arr.forEach(c => {
      const d = document.createElement('div');
      d.className = 'comment-card';
      d.innerHTML = `<div style="flex:1"><strong>${escapeHtml(c.author||'Anon')}</strong><div class="muted-small">${c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}</div><div>${escapeHtml(c.text||'')}</div></div>`;
      recentCommentsEl.appendChild(d);
    });
  }, err => {
    console.error('onValue commentsRefLocal error', err);
  });

})();
let visitorId = localStorage.getItem('visitorId');
if (!visitorId) {
  visitorId = 'v_' + Math.random().toString(36).slice(2, 10);
  localStorage.setItem('visitorId', visitorId);
}


async function awardBadge(badgeId, title) {
  try {

    const key = 'badges_v2_' + visitorId;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    if (existing.includes(badgeId)) return;
    existing.push(badgeId);
    localStorage.setItem(key, JSON.stringify(existing));


    if (typeof window.showBadgeToast === 'function') window.showBadgeToast(title || badgeId);


    if (typeof getDatabase !== 'undefined' && typeof dbRT !== 'undefined') {
      try {

        const db = dbRT;
        const path = `analytics/badges/${visitorId}/${badgeId}`;

        await update(ref(db, path), {
          title: title || badgeId,
          awardedAt: Date.now()
        });
      } catch (e) {

        console.warn('Badge push failed (firebase):', e);
      }
    }
  } catch (e) {
    console.error('awardBadge error', e);
  }
}


window.awardBadge = awardBadge;


function transitionPage(targetPageId) {
  if (typeof anime === 'undefined') {
    console.warn("Anime.js tidak dimuat. Menggunakan transisi CSS biasa.");


    const currentPage = document.querySelector('.page.active');
    if (currentPage) {
      currentPage.classList.remove('active');
    }
    const nextPage = document.getElementById(targetPageId);
    if (nextPage) {
      nextPage.classList.add('active');
    }
    return;
  }

  const currentPage = document.querySelector('.page.active');
  const nextPage = document.getElementById(targetPageId);

  if (!nextPage || nextPage === currentPage) return;


  if (currentPage) {
    anime({
      targets: currentPage,
      opacity: 0,
      translateX: ['0%', '-5%'],
      duration: 300,
      easing: 'easeOutQuad',
      complete: () => {

        currentPage.classList.remove('active');
        currentPage.style.transform = '';


        nextPage.classList.add('active');

        anime({
          targets: nextPage,
          opacity: [0, 1],
          translateX: ['5%', '0%'],
          duration: 400,
          easing: 'easeOutQuad',
          delay: 50,
          complete: () => {

            nextPage.style.opacity = 1;
          }
        });
      }
    });
  } else {

    nextPage.classList.add('active');
    anime({
      targets: nextPage,
      opacity: [0, 1],
      duration: 500,
      easing: 'easeOutQuad'
    });
  }
}


if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      console.log('ServiceWorker registered: ', reg);


      if (reg.waiting) {
        notifyForUpdate(reg);
      }
      reg.addEventListener('updatefound', () => {
        const newSW = reg.installing;
        newSW.addEventListener('statechange', () => {
          if (newSW.state === 'installed' && navigator.serviceWorker.controller) {

            notifyForUpdate(reg);
          }
        });
      });

    } catch (err) {
      console.warn('ServiceWorker registration failed: ', err);
    }
  });
}


function notifyForUpdate(registration) {

  const shouldRefresh = confirm('Versi baru tersedia. Muat ulang untuk mengaktifkan pembaruan?');
  if (shouldRefresh) {
    registration.waiting.postMessage({
      type: 'SKIP_WAITING'
    });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }
}


let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  const installBtn = document.createElement('button');
  installBtn.textContent = 'Install App';
  installBtn.style.position = 'fixed';
  installBtn.style.right = '20px';
  installBtn.style.bottom = '20px';
  installBtn.style.zIndex = 99999;
  document.body.appendChild(installBtn);
  installBtn.addEventListener('click', async () => {
    installBtn.disabled = true;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      console.log('User accepted the A2HS prompt');
      installBtn.remove();
    } else {
      console.log('User dismissed the A2HS prompt');
      installBtn.disabled = false;
    }
    deferredPrompt = null;
  });
});
