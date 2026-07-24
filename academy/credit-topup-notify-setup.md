# Credit top-up email notifications

By default, when a student submits a top-up request in `/academy/`, it's
saved to Firestore and you only see it if you happen to open
`admin.html` → **Academy — Credit Top-ups**. This adds an email to
**makaranen@gmail.com** the moment a request comes in, so you don't have to
keep checking.

This doesn't change anything about how top-ups work — Firestore, the
`creditRequests` collection, and approving/rejecting in `admin.html` all
stay exactly the same. This just adds an email on top.

## 1. Create the script

1. Go to [script.google.com/home](https://script.google.com/home) and click
   **New project** (no spreadsheet needed for this one).
2. Select all the placeholder code (`function myFunction() {}`) and delete it.
3. Open `credit-topup-notify-handler.gs` (included in this project) and paste
   its full contents into the editor.
4. Click the save icon (or Ctrl/Cmd+S).

The email address is already set to `makaranen@gmail.com` near the top of
the script (`NOTIFY_EMAIL`) — edit that line if you ever want notifications
to go somewhere else.

## 2. Deploy it as a Web App

1. Click **Deploy → New deployment**.
2. Next to "Select type," click the gear icon and choose **Web app**.
3. Fill in:
   - **Execute as:** Me (your Google account)
   - **Who has access:** Anyone
     (This has to be "Anyone" so the public site can trigger it — it does
     *not* give visitors any access to your Gmail, only permission to run
     this one script's `doPost` function.)
4. Click **Deploy**. The first time, Google will ask you to authorize the
   script — click through the "Google hasn't verified this app" warning
   (expected for your own scripts) and allow it.
5. Copy the **Web app URL** shown — it looks like
   `https://script.google.com/macros/s/AKfycb.../exec`.

## 3. Connect it in admin.html

1. Open `admin.html` and sign in (Academy — Approved Students panel — all three
   Academy panels share the same sign-in).
2. Scroll to **Academy — Pricing** → **Email notification on new top-up requests**.
3. Paste your Web app URL into **Notify top-up webhook URL**.
4. Click **Save pricing**.

That's it — from now on, every submitted top-up request sends an email to
makaranen@gmail.com with the student's name/email, package, amount, credits,
and the transaction reference/note they entered, so you know to check
`admin.html` and approve it. Come back to this same field any time to change
the URL or clear it (leave it blank and save to turn notifications off).

## Notes

- **If you edit the script later:** go to **Deploy → Manage deployments**,
  click the pencil/edit icon on the existing deployment, and choose
  **New version** before deploying again. Editing the script without doing
  this leaves the live `/exec` URL running the old code.
- **This is best-effort only.** If the endpoint isn't set, or Google is
  briefly unavailable, the student's top-up request still goes through
  normally in Firestore — only the email reminder would be missing that
  time. Check `admin.html` periodically regardless, just in case.
- **Nothing changes for students** — this is entirely a backstage addition;
  the top-up modal, packages, and "Your top-up requests" list all look and
  work exactly as before.
