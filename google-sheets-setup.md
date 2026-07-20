# Sending registration-form submissions straight to your email

The site's registration form block (Full Name, Email, Phone Number, Telegram
Username, Short Message) can email every submission straight to
**makaranen@gmail.com** the instant a visitor clicks Submit — no login for
the visitor, no email app popping up, nothing else for them to click. It
works using a free Google Apps Script "Web App," and doesn't require any
third-party account beyond the Google account you already have.

(It can *also* log every submission as a row in a Google Sheet at the same
time, if you want a running record — that part is optional, see step 1b.)

## 1. Create the script

1. Go to [script.google.com](https://script.google.com) and click **New project**.
   A blank Google Sheet is **not** required for this — email sending works
   on its own.
2. Select all the placeholder code (`function myFunction() {}`) and delete it.
3. Open `google-sheets-form-handler.gs` (included in this project) and paste
   its full contents into the editor.
4. Double-check the `NOTIFY_EMAIL` line near the top says
   `makaranen@gmail.com` (it does by default).
5. Click the save icon (or Ctrl/Cmd+S). You can rename the project at the
   top (e.g. "Registration form handler") if you like — it doesn't affect
   anything.

### 1b. Optional: also log to a Google Sheet

If you'd like a spreadsheet record in addition to the email, create a sheet
at [sheets.google.com](https://sheets.google.com), then in the Apps Script
editor go to **Resources / the "+" next to Services → Editor → Project
Settings**, or simply open the script from **Extensions → Apps Script**
*inside* that sheet instead of from script.google.com directly — either way,
as soon as the script is bound to a sheet, it will start appending a row per
submission automatically. If you skip this, the script still works fine —
it just emails you and skips the sheet part silently.

## 3. Deploy it as a Web App

1. Click **Deploy → New deployment**.
2. Next to "Select type," click the gear icon and choose **Web app**.
3. Fill in:
   - **Execute as:** Me (your Google account)
   - **Who has access:** Anyone
     (This has to be "Anyone" so the public site can submit to it — it does
     *not* give visitors any access to your sheet itself, only permission to
     run this one script's `doPost` function.)
4. Click **Deploy**. The first time, Google will ask you to authorize the
   script — click through the "Google hasn't verified this app" warning
   (this is expected for your own scripts) and allow it.
5. Copy the **Web app URL** shown — it looks like
   `https://script.google.com/macros/s/AKfycb.../exec`.

## 4. Connect it in admin.html

1. Open `admin.html`, sign in, load current content.
2. Find the page with your registration form (e.g. "Exclusive Educational
   Content" under **Pages**), open its registration-form block.
3. Paste the Web app URL into **Form submission endpoint**.
4. Make sure **Notify email** (the mailto field) is left **blank**. If it
   has an address in it, the form falls back to opening the visitor's own
   email app instead of submitting silently — only one of the two fields
   should be filled in at a time.
5. Click **Save changes**.

That's it — from now on, the moment a visitor clicks **Submit**, you'll get
an email at makaranen@gmail.com with their name, email, phone, Telegram, and
message — no further click needed from them or you.

## Notes

- **If you edit the script later:** go to **Deploy → Manage deployments**,
  click the pencil/edit icon on the existing deployment, and choose
  **New version** before deploying again. Editing the script without doing
  this leaves the live `/exec` URL running the old code.
- **Multiple forms, one sheet:** you can point more than one registration
  form block at the same Web app URL — all their submissions will land in
  the same sheet, in the order they come in.
- **Why the visitor doesn't get a "failed" message on network hiccups you
  can't see:** Google's Web App URLs don't let a public website read back
  their response (a browser security restriction, not something this site
  can work around). So once the request is sent, the visitor sees the
  thank-you message immediately — the site can't distinguish "saved
  successfully" from "Google silently rejected it." In practice this is
  reliable as long as the deployment is set up as above; just check the
  sheet occasionally to confirm rows are coming in. If you want the site to
  see and react to real success/failure responses, use a Formspree or
  Web3Forms endpoint instead (see the main README).
