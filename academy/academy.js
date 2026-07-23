// ============================================================================
// Meatika Trading Academy — auth + progress tracking
//
// One-time setup (Firebase project, Google sign-in, Firestore, security rules):
// see README-academy.md in this folder. Firebase project keys go in
// firebase-config.js (shared with admin.html's approved-students panel).
// ============================================================================

import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const els = {
  loginScreen: document.getElementById('loginScreen'),
  pendingScreen: document.getElementById('pendingScreen'),
  appScreen: document.getElementById('appScreen'),
  signInBtn: document.getElementById('signInBtn'),
  signOutBtn: document.getElementById('signOutBtn'),
  pendingSignOutBtn: document.getElementById('pendingSignOutBtn'),
  pendingEmail: document.getElementById('pendingEmail'),
  userAvatar: document.getElementById('userAvatar'),
  userName: document.getElementById('userName'),
  courseList: document.getElementById('courseList'),
  lessonPane: document.getElementById('lessonPane'),
  learningGrid: document.getElementById('learningGrid'),
  learningPane: document.getElementById('learningPane'),
  authError: document.getElementById('authError'),
  configWarning: document.getElementById('configWarning'),
};

let academyData = null;
let currentUser = null;
let userProgress = {}; // { lessonId: true }
let activeCourseId = null;
let activeLessonId = null;

let siteData = null; // ../data.json — learningFormats + news, shared with the main site
let activeFormat = null; // 'article' | 'video' | 'audio' | 'book' | null (null = showing a course)

// ---- Config sanity check (helps whoever sets this up spot a copy/paste miss) ----
if (firebaseConfig.apiKey.startsWith('PASTE_')) {
  els.configWarning.style.display = 'block';
}

// ---- Auth wiring ----
els.signInBtn.addEventListener('click', async () => {
  els.authError.textContent = '';
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    console.error(err);
    els.authError.textContent = 'Sign-in failed. Please try again.';
  }
});

els.signOutBtn.addEventListener('click', () => signOut(auth));
els.pendingSignOutBtn.addEventListener('click', () => signOut(auth));

function showScreen(name) {
  els.loginScreen.style.display = name === 'login' ? 'flex' : 'none';
  els.pendingScreen.style.display = name === 'pending' ? 'flex' : 'none';
  els.appScreen.style.display = name === 'app' ? 'flex' : 'none';
  window.dispatchEvent(new CustomEvent('academy-auth', { detail: { signedIn: name !== 'login' } }));
}

// ---- Approved-student check: only emails present in the "approvedStudents"
// Firestore collection get past this gate. Add/remove students there (see
// README-academy.md) — no code changes needed to approve someone. ----
async function isApprovedStudent(user) {
  if (!user.email) return false;
  const ref = doc(db, 'approvedStudents', user.email.toLowerCase());
  const snap = await getDoc(ref);
  return snap.exists();
}

onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (!user) {
    showScreen('login');
    return;
  }

  let approved = false;
  try {
    approved = await isApprovedStudent(user);
  } catch (err) {
    console.error('Approval check failed:', err);
  }

  if (!approved) {
    els.pendingEmail.textContent = user.email || '';
    showScreen('pending');
    return;
  }

  els.userName.textContent = user.displayName || user.email || 'Student';
  if (user.photoURL) els.userAvatar.src = user.photoURL;
  await loadProgress();
  await loadCourses();
  loadLearningCenter();
  showScreen('app');
});

// ---- Firestore progress: one doc per user at users/{uid} ----
async function loadProgress() {
  if (!currentUser) return;
  const ref = doc(db, 'users', currentUser.uid);
  const snap = await getDoc(ref);
  userProgress = (snap.exists() && snap.data().completedLessons) || {};
}

async function saveProgress() {
  if (!currentUser) return;
  const ref = doc(db, 'users', currentUser.uid);
  await setDoc(ref, {
    completedLessons: userProgress,
    displayName: currentUser.displayName || null,
    email: currentUser.email || null,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

async function toggleLesson(lessonId, done) {
  userProgress[lessonId] = done;
  await saveProgress();
  renderCourseList();
}

// ---- Content loading + rendering ----
async function loadCourses() {
  if (!academyData) {
    const res = await fetch('academy-data.json', { cache: 'no-store' });
    academyData = await res.json();
  }
  if (!activeCourseId && academyData.courses.length) {
    activeCourseId = academyData.courses[0].id;
  }
  renderCourseList();
}

function findCourse(id) {
  return academyData.courses.find(c => c.id === id);
}

function courseProgress(course) {
  const total = course.lessons.length;
  const done = course.lessons.filter(l => userProgress[l.id]).length;
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}

function renderCourseList() {
  els.courseList.innerHTML = academyData.courses.map(course => {
    const p = courseProgress(course);
    const isActive = course.id === activeCourseId;
    return `
      <button class="course-item ${isActive ? 'active' : ''}" data-course="${course.id}">
        <div class="course-item-top">
          <span class="course-item-title">${escapeHtml(course.title.en)}</span>
          <span class="course-item-pct">${p.pct}%</span>
        </div>
        <div class="progress-track"><div class="progress-fill" style="width:${p.pct}%"></div></div>
        <div class="course-item-sub">${p.done}/${p.total} lessons</div>
      </button>`;
  }).join('');

  els.courseList.querySelectorAll('.course-item').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCourseId = btn.dataset.course;
      activeLessonId = null;
      renderCourseList();
      renderLessonPane();
    });
  });

  renderLessonPane();
}

function renderLessonPane() {
  // Selecting a course always switches the shared main area back to the
  // course view, and clears any active Learning Center selection.
  activeFormat = null;
  renderLearningGrid();
  showPane('course');

  const course = findCourse(activeCourseId);
  if (!course) { els.lessonPane.innerHTML = ''; return; }
  if (!activeLessonId) activeLessonId = course.lessons[0]?.id || null;
  const lesson = course.lessons.find(l => l.id === activeLessonId);

  const lessonRows = course.lessons.map(l => {
    const done = !!userProgress[l.id];
    const isActive = l.id === activeLessonId;
    return `
      <div class="lesson-row ${isActive ? 'active' : ''}" data-lesson="${l.id}">
        <label class="lesson-check" title="Mark complete">
          <input type="checkbox" data-check="${l.id}" ${done ? 'checked' : ''}>
          <span></span>
        </label>
        <div class="lesson-row-text">
          <div class="lesson-row-title">${escapeHtml(l.title.en)}</div>
          <div class="lesson-row-duration">${escapeHtml(l.duration || '')}</div>
        </div>
      </div>`;
  }).join('');

  const videoBlock = lesson && lesson.videoUrl
    ? `<div class="video-wrap"><iframe src="${escapeAttr(lesson.videoUrl)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>`
    : `<div class="video-wrap video-empty">No video attached to this lesson yet.</div>`;

  els.lessonPane.innerHTML = `
    <div class="course-header">
      <h2>${escapeHtml(course.title.en)}</h2>
      <p>${escapeHtml(course.description.en)}</p>
    </div>
    <div class="lesson-layout">
      <div class="lesson-list">${lessonRows}</div>
      <div class="lesson-main">
        ${lesson ? `
          ${videoBlock}
          <h3 class="lesson-title">${escapeHtml(lesson.title.en)}</h3>
          <p class="lesson-desc">${escapeHtml(lesson.description.en)}</p>
          <label class="complete-toggle">
            <input type="checkbox" data-check="${lesson.id}" ${userProgress[lesson.id] ? 'checked' : ''}>
            <span>Mark lesson as complete</span>
          </label>
        ` : '<p class="lesson-desc">Select a lesson from the list.</p>'}
      </div>
    </div>`;

  els.lessonPane.querySelectorAll('.lesson-row').forEach(row => {
    row.addEventListener('click', (e) => {
      if (e.target.closest('.lesson-check')) return;
      activeLessonId = row.dataset.lesson;
      renderLessonPane();
    });
  });

  els.lessonPane.querySelectorAll('input[data-check]').forEach(cb => {
    cb.addEventListener('change', (e) => {
      e.stopPropagation();
      toggleLesson(cb.dataset.check, cb.checked);
    });
  });
}

// ---- Learning Center: free content (article/video/audio/book), no sign-in
// gate of its own — it shares the sidebar "board" with Courses, and renders
// its content into the same main area, instead of living on a separate page.
async function loadLearningCenter() {
  try {
    if (!siteData) {
      const res = await fetch('../data.json', { cache: 'no-store' });
      siteData = await res.json();
    }
    renderLearningGrid();
  } catch (err) {
    console.error('Learning Center failed to load:', err);
  }
}

function showPane(which) {
  els.lessonPane.style.display = which === 'course' ? 'block' : 'none';
  els.learningPane.style.display = which === 'learning' ? 'block' : 'none';
}

function renderLearningGrid() {
  if (!siteData || !els.learningGrid) return;
  const formats = siteData.learningFormats || [];
  els.learningGrid.innerHTML = formats.map(item => {
    const title = (item.title && item.title.en) || item.id;
    const icon = window.mthIconSvg ? window.mthIconSvg(item.icon, item.iconColor || '#fff') : '';
    const isActive = item.id === activeFormat;
    return `
      <button class="learning-card ${isActive ? 'active' : ''}" data-format="${item.id}" type="button">
        <span class="learning-icon" style="background:${escapeAttr(item.color || '#4c7fff')}"><svg viewBox="0 0 24 24" fill="none">${icon}</svg></span>
        <span class="learning-card-title">${escapeHtml(title)}</span>
      </button>`;
  }).join('');

  els.learningGrid.querySelectorAll('.learning-card').forEach(btn => {
    btn.addEventListener('click', () => {
      activeFormat = btn.dataset.format;
      renderLearningGrid();
      renderLearningPane();
    });
  });
}

function learningItemHtml(item) {
  const title = (item.title && item.title.en) || 'Untitled';
  const excerpt = (item.excerpt && item.excerpt.en) || '';
  const posterFn = window.MTHSite && window.MTHSite.cloudinaryVideoPosterUrl;
  const videoPoster = item.video && item.video.type === 'file' && posterFn ? posterFn(item.video.file) : '';
  const thumb = item.cover || videoPoster;
  const thumbHtml = thumb
    ? `<div class="learning-item-thumb" style="background-image:url('${escapeAttr(thumb)}')"></div>`
    : `<div class="learning-item-thumb"><svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M4 5h16v14H4z" stroke="currentColor" stroke-width="1.6"/><path d="m4 15 4.5-4.5L12 14l3-3 5 5" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/></svg></div>`;
  return `
    <a class="learning-item" href="../article.html?id=${encodeURIComponent(item.id)}">
      ${thumbHtml}
      <div class="learning-item-body">
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(excerpt)}</p>
      </div>
    </a>`;
}

function renderLearningPane() {
  if (!siteData || !activeFormat) return;
  showPane('learning');

  const formatMeta = (siteData.learningFormats || []).find(f => f.id === activeFormat) || {};
  const title = (formatMeta.title && formatMeta.title.en) || activeFormat;
  const desc = (formatMeta.desc && formatMeta.desc.en) || '';
  const icon = window.mthIconSvg ? window.mthIconSvg(formatMeta.icon, formatMeta.iconColor || '#fff') : '';

  const allItems = window.MTHNews ? MTHNews.publishedNews(siteData) : (siteData.news || []).filter(n => n.published !== false);
  const items = allItems.filter(n => (window.MTHNews ? MTHNews.formatInfo(n).label.toLowerCase() : '') === activeFormat);

  const listHtml = items.length
    ? `<div class="learning-items">${items.map(learningItemHtml).join('')}</div>`
    : `<p class="learning-empty">Nothing here yet — check back soon.</p>`;

  els.learningPane.innerHTML = `
    <div class="learning-header">
      <span class="learning-icon" style="background:${escapeAttr(formatMeta.color || '#4c7fff')}"><svg viewBox="0 0 24 24" fill="none">${icon}</svg></span>
      <div>
        <h2>${escapeHtml(title)}</h2>
        <p>${escapeHtml(desc)}</p>
      </div>
    </div>
    ${listHtml}`;
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, s => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[s]));
}
function escapeAttr(str) { return escapeHtml(str); }
