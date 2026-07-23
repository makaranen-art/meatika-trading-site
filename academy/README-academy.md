# Meatika Trading Academy — setup

This adds a Google-login e-learning page at `/academy/`, built to sit alongside your
existing static site on GitHub Pages. It uses **Firebase** (Google's own service) for two things:

- **Authentication** — real "Sign in with Google," no backend server needed.
- **Firestore** — a small free database that stores each signed-in user's lesson
  completion, so progress is saved across devices.

Both are free at this scale (Firebase's free "Spark" plan covers far more sign-ins and
reads/writes than a course site like this will use).

## One-time setup (10–15 minutes)

1. Go to **[console.firebase.google.com](https://console.firebase.google.com)** and create a new project (any name, e.g. "Meatika Academy"). You can leave Google Analytics off.
2. In the left sidebar: **Build → Authentication → Get started**. On the "Sign-in method" tab, enable **Google**, pick a support email, and save.
3. In the left sidebar: **Build → Firestore Database → Create database**. Choose a region close to Cambodia (e.g. `asia-southeast1`), and start in **production mode**.
4. Still in Firestore, go to the **Rules** tab, replace the contents with the block below, and click **Publish**. Replace `'you@gmail.com'` with the Google email(s) you'll actually use to sign in to `admin.html` — add more, comma-separated, if more than one person will approve students:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       function isAdmin() {
         return request.auth != null &&
           request.auth.token.email.lower() in ['you@gmail.com'];
       }

       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       match /approvedStudents/{email} {
         allow read: if request.auth != null &&
           (request.auth.token.email.lower() == email || isAdmin());
         allow write: if isAdmin();
       }
     }
   }
   ```

   This means: a student can only check *their own* email against the approved list, and
   only the admin email(s) you list can view the full list or add/remove anyone — nobody
   can approve themselves from the browser.

5. Click the **gear icon → Project settings**, scroll to "Your apps," click the **Web (`</>`)** icon, register an app (any nickname), and copy the `firebaseConfig` object it shows you.
6. Open `academy/firebase-config.js` in this repo and paste your values into the `firebaseConfig` object. Both `academy.js` (the student page) and `admin.html` (the approval panel) import this same file.
7. Back in **Authentication → Settings → Authorized domains**, add the domain(s) the site will actually be served from — e.g. `meatikatrading.com` and/or `<your-username>.github.io`. (`localhost` is already allowed by default, for testing.)
8. Commit and push. Once GitHub Pages redeploys, visit `/academy/` and try signing in.

## Editing course content

**The easy way:** open `admin.html`, set up (or reuse) the **GitHub connection** panel near the
top, then scroll to **Academy — Courses**. Click **Load courses**, add/edit courses and
lessons with plain form fields (title, description, duration, video link — English and
Khmer), then click **Save courses**. This writes straight to
`academy/academy-data.json` in your repo, the same way the rest of the site's content saves.

**The manual way:** course and lesson content also lives directly in
`academy/academy-data.json` if you'd rather edit the file by hand — no code changes needed
for that part either. Each course has a title, description, and a list of lessons; each
lesson has a title, duration label, description, and a `videoUrl`.

For `videoUrl`, use a YouTube (or Vimeo) **embed** URL, e.g.:
```
https://www.youtube.com/embed/VIDEO_ID
```
Leave it as an empty string `""` for lessons that don't have a video yet — the page will
show "No video attached to this lesson yet" instead of a broken player.

## Learning Center + Meatika Course tabs

`/academy/index.html` now shows two tabs at the top:
- **Learning Center (Free Content)** — the Learning Center (`news.html`) embedded right in
  the Academy page. No sign-in required; anyone can read it.
- **Meatika Course (Membership Required)** — the existing Google sign-in + approved-student
  dashboard described in this file, unchanged.

The Learning Center's old registration form (Full Name/Phone/Email/Trading Experience,
which logged to a Google Sheet) has been removed — that content is free and open to
everyone now.

## What this does and doesn't protect

Google sign-in genuinely gates the `/academy/` page — only people who sign in can reach
the dashboard, and their progress is private to them. What it does **not** do is hide the
raw video files/links from someone who already has the direct URL, since GitHub Pages is
a static file host with no server to enforce that. For YouTube-hosted lessons set to
"Unlisted" (not "Public"), this is a reasonable, low-effort level of protection for a
course site like this — the same approach many small course sites use.

## Approving students (only approved emails get in)

Anyone can *sign in* with Google, but signing in isn't enough — the page then checks the
account's email against an `approvedStudents` collection in Firestore. If the email isn't
there, the visitor sees a "pending approval" screen instead of the dashboard, showing the
email they signed in with (so you know which one to add).

**Manage this from `admin.html`** — scroll to the **Academy — Approved Students** panel:

1. Click **Sign in with Google** and use the same Google account listed in the Firestore
   rules above (the `isAdmin()` list) — this is a separate sign-in from the GitHub
   connection used for the rest of the admin panel.
2. Type a student's email and click **+ Approve student**. They can refresh `/academy/`
   (or sign out and back in) and they'll see the dashboard.
3. Click **Remove** next to any email in the list to revoke their access immediately.

Changes save straight to Firestore the moment you click — there's no separate "Save
changes" step for this panel, and it's independent of the GitHub-based content editor
above it.

If you ever need to do this without opening `admin.html` — e.g. straight after setup,
before you've added your email to the rules — you can also add/remove documents directly
in the [Firebase console](https://console.firebase.google.com) under **Firestore Database
→ Data → approvedStudents**, using the student's lowercase email as the Document ID.
