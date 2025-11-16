/******** APP (Realtime Database) ********/
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
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

/******** FIREBASE CONFIG ********/
// Gunakan config dari Firebase Console (Project settings -> Your apps -> SDK snippet)
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

/******** INIT FIREBASE ********/
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

/******** DRAWER MENU ********/
const menuBtn = document.getElementById("menuBtn");
const drawer = document.getElementById("drawer");

if (menuBtn) menuBtn.addEventListener("click", () => {
  drawer.classList.toggle("open");
});

/******** PAGE NAVIGATION ********/
document.querySelectorAll(".nav-link").forEach(a => {
  a.onclick = e => {
    e.preventDefault();
    const page = a.dataset.page;
    showPage(page);
    drawer.classList.remove("open");
  };
});

function showPage(id){
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const el = document.getElementById(id);
  if(el) el.classList.add("active");
}

/******** CARD FLIP ********/
const profileCard = document.getElementById("profileCard");
if(profileCard) profileCard.onclick = () => profileCard.classList.toggle("flipped");

/******** COMMENTS (Realtime DB) ********/
const commentsWrap = document.getElementById("commentsWrap");
const commentForm = document.getElementById("commentForm");
const authorInput = document.getElementById("authorInput");
const commentInput = document.getElementById("commentInput");
const sendBtn = document.getElementById("sendBtn");

// helper: format timestamp (RTDB biasanya menyimpan millis)
function fmtTime(ts){
  if(!ts) return "";
  // kalau ts adalah number (ms)
  if(typeof ts === 'number') return new Date(ts).toLocaleString();
  // kalau string number
  const n = Number(ts);
  if(!isNaN(n)) return new Date(n).toLocaleString();
  // fallback
  try {
    return new Date(ts).toLocaleString();
  } catch(e){ return ""; }
}

// render one comment
function renderComment(data){
  const card = document.createElement("div");
  card.className = "comment-card";

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
      <div class="comment-text">${textEsc}</div>
    </div>
  `;
  return card;
}

// basic HTML escape
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, function(m){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m];
  });
}

// listen to commentsRealtime ordered by createdAt
try {
  const q = dbQuery(commentsRef, orderByChild('createdAt'));
  onValue(q, snapshot => {
    commentsWrap.innerHTML = "";
    const val = snapshot.val();
    if(!val) {
      // no comments yet
      const empty = document.createElement('div');
      empty.className = 'small-muted';
      empty.textContent = 'Belum ada komentar.';
      commentsWrap.appendChild(empty);
      return;
    }
    // convert map -> array
    const arr = Object.keys(val).map(key => ({ id: key, ...val[key] }));
    // sort descending by createdAt (newest first)
    arr.sort((a,b)=> (b.createdAt || 0) - (a.createdAt || 0));
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

/******** SEND COMMENT (push to RTDB) ********/
if(commentForm){
  commentForm.onsubmit = async (e) => {
    e.preventDefault();
    const author = (authorInput?.value || "").trim();
    const text = (commentInput?.value || "").trim();

    if(!author || !text){
      alert("Nama dan komentar harus diisi.");
      return;
    }

    try {
      sendBtn.disabled = true;
      // push data dengan serverTimestamp
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

