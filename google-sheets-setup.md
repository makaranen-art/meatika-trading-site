# Sending registration-form submissions to a Google Sheet

The site's registration form block (Full Name, Email, Phone Number, Telegram
Username, Short Message) can send every submission straight into a Google
Sheet, with no backend server or paid service required. It works using a
free Google Apps Script "Web App" attached to the sheet.

## 1. Create the sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new,
   blank spreadsheet. Name it something like **Meatika Trading — Registrations**.
2. Leave the first sheet/tab empty — the script fills in the header row for
   you the first time it runs.

## 2. Add the script

1. In the sheet, go to **Extensions → Apps Script**. A new tab opens with a
   code editor and a placeholder `Code.gs` file.
2. Select all the placeholder code and delete it.
3. Open `google-sheets-form-handler.gs` (included in this project) and paste
   its full contents into the editor.
4. Click the save icon (or Ctrl/Cmd+S). You can rename the project at the
   top (e.g. "Registration form handler") if you like — it doesn't affect
   anything.

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
4. Click **Save changes**.

That's it — submissions will now show up as new rows in your sheet within
a second or two of someone submitting the form.

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
