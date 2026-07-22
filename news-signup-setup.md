# News & Articles access gate → Google Sheet

Visitors now have to fill in a short form (Full Name, Phone Number, Email,
Trading Experience) before they can see the **News & Articles** page
(`news.html`). Each submission gets added as a row in a Google Sheet you
control. This is a separate, simpler form from the "Exclusive Content"
registration block used elsewhere on the site — it doesn't touch
`admin.html` or `data.json` at all.

Once a visitor submits the form successfully, their browser remembers it
(so they won't be asked again on that device) and the News & Articles
content unlocks immediately.

## 1. Create a Google Sheet

Go to [sheets.google.com](https://sheets.google.com) and create a new,
blank sheet. Name it something like "News Page Signups."

## 2. Add the script

1. In that sheet, go to **Extensions → Apps Script**. This opens the script
   editor already linked to your sheet — that link is what lets the script
   write rows into it.
2. Select all the placeholder code (`function myFunction() {}`) and delete it.
3. Open `news-signup-form-handler.gs` (included in this project) and paste
   its full contents into the editor.
4. Click the save icon (or Ctrl/Cmd+S).

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
   (expected for your own scripts) and allow it.
5. Copy the **Web app URL** shown — it looks like
   `https://script.google.com/macros/s/AKfycb.../exec`.

## 4. Connect it in admin.html

1. Open `admin.html`, sign in, and click **Load current content**.
2. Find the **"News & Articles access gate"** panel.
3. Paste the Web app URL you copied into **Google Sheet Web App URL**.
4. Click **Save changes** at the bottom of the page.

That's it — from now on, every visitor to News & Articles fills in the form
once, their details land as a new row in your sheet (Timestamp, Full Name,
Phone Number, Email, Trading Experience), and the page unlocks.

## Notes

- **If you edit the script later:** go to **Deploy → Manage deployments**,
  click the pencil/edit icon on the existing deployment, and choose
  **New version** before deploying again. Editing the script without doing
  this leaves the live `/exec` URL running the old code.
- **"Unlock once per device," not once per person:** the unlock is
  remembered in the visitor's browser (localStorage), not tied to their
  identity. Clearing browser data, or visiting from a different device or
  browser, will show the form again.
- **Article pages aren't gated:** this only gates `news.html` (the News &
  Articles list). If a visitor reaches an individual article directly
  (`article.html?...`) via a shared link or search engine, they can read it
  without going through the gate first. Let me know if you'd like that
  page gated too — it's a small addition.
- Why the visitor doesn't see a "failed" message on network hiccups you
  can't see: Google's Web App URLs don't let a public website read back
  their response (a browser restriction, not something this site can work
  around). In practice this is reliable as long as the deployment is set up
  as above — just check the sheet occasionally to confirm rows are coming
  in.
