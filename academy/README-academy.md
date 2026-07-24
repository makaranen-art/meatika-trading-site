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
         allow read: if request.auth != null && request.auth.uid == userId;
         // A student can save their own progress and *spend* credits (unlocking a
         // lesson only ever lowers their own balance), but can never raise their own
         // balance — only isAdmin() can increase `credits`, via the top-up approval flow.
         allow write: if request.auth != null && request.auth.uid == userId &&
           (!('credits' in request.resource.data) ||
            !('credits' in resource.data) ||
            request.resource.data.credits <= resource.data.credits);
         allow write: if isAdmin();
       }
       match /approvedStudents/{email} {
         allow read: if request.auth != null &&
           (request.auth.token.email.lower() == email || isAdmin());
         allow write: if isAdmin();
       }
       match /accessRequests/{email} {
         allow create, update: if request.auth != null &&
           request.auth.token.email.lower() == email;
         allow read, delete: if isAdmin();
       }
       match /creditRequests/{requestId} {
         // A student can create their own top-up request and read only their own
         // requests (to see pending/approved/rejected status); only isAdmin() can
         // list every request or change its status (i.e. actually grant credits).
         allow create: if request.auth != null && request.resource.data.uid == request.auth.uid;
         allow read: if request.auth != null &&
           (resource.data.uid == request.auth.uid || isAdmin());
         allow update, delete: if isAdmin();
       }
       match /config/{docId} {
         // Pricing (credits-per-minute, top-up packages, payment info) is stored
         // here so admin.html can edit it without a code change. Any signed-in
         // student can read it (they need it to see prices in the app), but only
         // isAdmin() can change it.
         allow read: if request.auth != null;
         allow write: if isAdmin();
       }
     }
   }
   ```

   This means: a student can only check *their own* email against the approved list, and
   only the admin email(s) you list can view the full list or add/remove anyone — nobody
   can approve themselves from the browser. It also means a student can spend their own
   credits to unlock a lesson, and can submit/view their own top-up requests, but the
   only way a balance ever goes *up* is through the admin approval flow in `admin.html` —
   editing `credits` upward from the browser console is blocked by the rules above.

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

For `videoUrl`, paste a normal YouTube, Vevo, or Vimeo share/watch URL. The Academy converts supported links to a safe player automatically, e.g.:
```
https://www.youtube.com/watch?v=VIDEO_ID
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

## Credits & paid lessons

The Main Course can charge credits per lesson instead of being entirely free. This is
**manual billing**, matching how student approval already works — there's no payment
gateway, so no card numbers or bank credentials ever touch this codebase.

**How it works for a student:**
1. They click the credit-balance pill (top right, once signed in) to open the top-up modal.
2. They pay by ABA/Bakong transfer using the details shown there, then submit the
   transaction reference (or phone number used) — this creates a pending request, visible
   to them under "Your top-up requests."
3. Once you approve it (see below), their balance updates automatically the next time
   they open or refresh the Academy.
4. Locked lessons show a 🔒 badge with their price; the first lesson of every course is
   free (marked `"free": true` in `academy-data.json`) so students can preview a course
   before spending anything. Unlocking a lesson spends credits once — re-watching it later
   is free.

**Pricing knobs** — `CREDITS_PER_MINUTE` (lesson price = video length in minutes × this
number), the three top-up packages (**Beginner**, **Intermediate**, **Advance** — each
with its own `$` price, plan credits granted, and optional bonus credits), and
`PAYMENT_INFO` (the ABA/Bakong details shown in the top-up modal, in English and Khmer)
all live in Firestore now, under a single `config/pricing` document, and can be edited
from **`admin.html` → Academy — Pricing** — sign in the same way as the Approved
Students/Credit Top-ups panels (shared sign-in), edit the fields, and click **Save
pricing**. Changes take effect for students the next time they load `/academy/`.

Defaults (used until you save something different): Beginner $2.99 → 5,000 credits;
Intermediate $6.99 → 12,000 credits + 1,500 bonus; Advance $11.99 → 21,000 credits +
4,000 bonus. Students pick one of the three when they open the top-up modal from the
credit-balance pill; whichever they pick is what's submitted with their transaction
reference for admin approval.

`academy/academy.js` still has the same values as hardcoded fallback constants near the
top of the file (`CREDITS_PER_MINUTE`, `PACKAGES`, `PAYMENT_INFO`) — these are only used
if the `config/pricing` document doesn't exist yet (e.g. right after setup, before you've
saved anything from the admin panel), so the site keeps working even before you touch the
Pricing panel. Once you save from `admin.html` at least once, the Firestore values take
over.

## Student plan dashboard

Once signed in, a student's credit-balance pill opens a modal that now leads with a
**plan dashboard**: Plan credits (lifetime credits granted from package purchases),
Bonus credits (lifetime bonus credits granted, from a package's bonus or a manual
admin top-up), Total credits (the two added together), Used (lifetime credits spent
unlocking lessons), and Remaining (current spendable balance). These numbers refresh
every time the modal is opened, so students always see their latest admin-approved
balance without needing to refresh the whole page.

Behind the scenes this adds three fields to each student's `users/{uid}` document —
`planCredits`, `bonusCredits`, and `usedCredits` — alongside the existing `credits`
(remaining balance) and `unlockedLessons`. Approving a top-up request now adds to both
`credits` and the matching `planCredits`/`bonusCredits` totals; unlocking a lesson adds
its cost to `usedCredits`. A manual credit adjustment in `admin.html` (positive amounts
only) is tracked as bonus credits, since it isn't tied to a package purchase.

## Viewing every student's plan and credits (admin)

`admin.html` → **Academy — Student Credits & Plans** lists every student who has signed
in at least once, with their plan credits, bonus credits, used credits, and remaining
balance side by side — sign in the same way as the other Academy panels (shared
sign-in) and click **Refresh** any time to pull the latest numbers.

**Approving top-ups (`admin.html` → Academy — Credit Top-ups):**
1. Sign in the same way as the Approved Students panel above (shared sign-in).
2. Each pending request shows the student, amount paid, credits requested, and the
   transaction reference/note they entered. Check it against your bank/e-wallet statement.
3. Click **Approve** to add the credits to their balance, or **Reject** if it doesn't check
   out — both remove it from the pending list (rejected requests are kept, marked
   `rejected`, for your records).
4. **Manually add credits** further down lets you adjust any student's balance directly by
   email (bonuses, refunds, fixing a mistake) without going through a request.

This depends on the Firestore rules in the setup section above (specifically the
`creditRequests` rule and the updated `users` rule) — a student's balance can only ever be
raised by the admin-approval path, never directly from their own browser.

## What this does and doesn't protect

Google sign-in genuinely gates the `/academy/` page — only people who sign in can reach
the dashboard, and their progress is private to them. What it does **not** do is hide the
raw video files/links from someone who already has the direct URL, since GitHub Pages is
a static file host with no server to enforce that. For YouTube-hosted lessons set to
"Unlisted" (not "Public"), this is a reasonable, low-effort level of protection for a
course site like this — the same approach many small course sites use.

## Registration and approval flow

New visitors sign in with Google, then complete their full name and phone number. Their registration is saved as an access request and the Academy remains locked until an administrator approves their email in the **Academy — Approved Students** panel in `admin.html`.

## Approving students

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
