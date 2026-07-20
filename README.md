# Meatika Trading Affiliate

Single-page forex & crypto partnership hub for Meatika Trading — broker links, community channels, and support, with light/dark theme and English/Khmer language toggle.

Site content (links, titles, descriptions, cards, sections) now lives in **`data.json`** and is editable through **`admin.html`** — no code editing required for day-to-day updates.

Admins can also create **pages** (internal subpages) right from `admin.html`. A page has its own title, intro text, and sections/cards — built with the exact same editor as the homepage. Any card, in any section, on the homepage or on another page, can be pointed at one of these pages instead of an external URL, so you can build multi-level menus entirely inside the site.

A page can also include a **registration form block** — a fixed lead-capture form (Full Name, Email, Phone Number, optional Telegram Username, Short Message) for things like "register for exclusive educational content." Since the site has no backend, submissions are sent straight from the visitor's browser. Three ways to receive them, pick one per form:
- **Straight to your email, no signup** — fill in "Send directly to your email" with your address. Submitting opens a pre-filled email in the visitor's own email app, addressed to you; they click Send. Zero setup, but relies on the visitor having a working email app and taking that one extra click.
- **A form service that emails you automatically** — sign up free at [Web3Forms](https://web3forms.com) with your email (instant access key, no account) or [Formspree](https://formspree.io), then fill in "Form submission endpoint" (and "Access key" for Web3Forms). More reliable than the mailto option since delivery happens automatically, no click needed from the visitor.
- **Straight into a Google Sheet** — see `google-sheets-setup.md` for the full walkthrough (uses the included `google-sheets-form-handler.gs` Apps Script). Paste the resulting Google Apps Script URL into "Form submission endpoint."

A ready-made "Exclusive Educational Content" page with this form is already set up under **Pages** in `admin.html` (and linked from a "Free Education" card on the homepage), sending straight to an email address by default — open it to change or replace that address.

The admin panel can also update the site's **logo (light/dark theme) and favicon** — upload any image and it's automatically resized and centered to match the site's existing logo/icon dimensions, so it always displays cleanly.

Admins can also publish **news posts / articles** from `admin.html` — each one has a title, short excerpt, full text (English + Khmer), an optional cover photo, and an optional video (paste a YouTube/Facebook/Vimeo link, or upload a short video file directly). Every article automatically gets a **Share this article** row (Facebook, Telegram, X, WhatsApp, copy link) — nothing to configure. Articles can be saved as a draft (unchecking "Published") before going live on the public news list.

## Live site

Once GitHub Pages is enabled (see below), the site will be available at:

```
https://<your-username>.github.io/<repo-name>/
```

The admin panel will be at:

```
https://<your-username>.github.io/<repo-name>/admin.html
```

## Hosting on GitHub Pages

1. Push this repo to GitHub (see commands below).
2. In the repo, go to **Settings → Pages**.
3. Under "Build and deployment," set **Source** to `Deploy from a branch`.
4. Choose the `main` branch and `/ (root)` folder, then **Save**.
5. GitHub will publish the site within a minute or two at the URL above.

## Pushing this repo

```bash
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

## Custom domain (optional)

To use a custom domain instead of the github.io URL:

1. Add a `CNAME` file to the repo root containing just your domain, e.g. `meatikatrading.com`.
2. At your domain registrar, add a `CNAME` DNS record pointing to `<your-username>.github.io` (or `A` records pointing to GitHub's Pages IPs if using an apex domain).
3. In **Settings → Pages**, enter the custom domain and enable "Enforce HTTPS" once DNS has propagated.

## Project structure

```
index.html              Main page — fetches data.json and renders everything
page.html                 Generic subpage — renders one admin-created page (page.html?id=<pageId>)
news.html                   News list — shows all published articles
article.html                 Single article view — video embed, body text, social share buttons
admin.html                     Password-gated editor for non-technical admins
data.json                        All editable content: ticker, hero text, sections, cards, pages, news
google-sheets-form-handler.gs      Apps Script code — appends registration-form submissions to a Google Sheet
google-sheets-setup.md              Step-by-step guide for wiring the registration form to a Google Sheet
favicon.ico                        Multi-size favicon
assets/
  icons.js                            Shared icon set used by index.html, page.html and admin.html
  site.js                              Shared rendering logic (sections/cards) used by index.html and page.html
  news.js                                Shared news/article rendering + social share links, used by news.html and article.html
  news/                                    Cover photos and uploaded videos for articles (created automatically on first upload)
  mth-logo.png                              Logo — light theme variant
  mth-logo-white.png                         Logo — dark theme variant
  favicon-16x16.png                            Favicon
  favicon-32x32.png                             Favicon
  favicon-48x48.png                              Favicon
  apple-touch-icon.png                            iOS home screen icon
```

## Using the admin panel (for non-technical admins)

`admin.html` lets someone edit every card, link, and text on the site from a browser, and save the change directly to this GitHub repo. GitHub Pages then automatically rebuilds the live site within a minute or two.

**Before handing this off to an admin, do two things:**

1. **Change the default admin password.** It ships set to `ChangeMe123`. Open `admin.html` in a browser, open the browser's developer console, and run:
   ```js
   crypto.subtle.digest('SHA-256', new TextEncoder().encode('yourNewPassword'))
     .then(b => console.log(Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('')))
   ```
   Copy the printed hash and paste it in place of `ADMIN_PASSWORD_HASH` near the top of `admin.html`'s script, then commit and push that change.

2. **Understand what actually protects the site.** This repository is public (a requirement for free GitHub Pages), so the `admin.html` source — including the password hash — is visible to anyone who looks at the repo. The password screen is a courtesy that keeps casual visitors out; the real protection is the **GitHub Personal Access Token**, which only the admin should hold, since saving is impossible without it.

**What the admin does day-to-day:**

1. Open `admin.html`, sign in with the password.
2. Expand **GitHub connection**, fill in the repo owner and name (once — can be "remembered" on that device), and paste a GitHub token.
   - Create one at [github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new): restrict it to this one repository, and set **Contents → Read and write**.
3. Click **Load current content**.
4. Edit ticker items, hero text, or any section/card — add or remove cards and whole sections freely, change titles, descriptions (English + Khmer), links, icons, and colors.
5. To add an internal subpage instead of an external link: scroll to the **Pages** panel and click **+ Add page** (or, on any card, set **Link type** to "Internal page" and choose "+ Create new page…"). Give the page a title and intro text, then add sections/cards to it exactly like you would on the homepage — a page can even link to other pages. To add a registration form to any page, click **+ Add registration form** in that page's content-blocks toolbar, then paste in a form endpoint URL from a service like Formspree or Web3Forms (create a free form there first — it gives you the URL to paste in).
6. To update the logo or favicon: open the **Branding** panel at the top, choose new image file(s), and click **Save logo & favicon** (separate from the content Save button, saves immediately).
7. To publish news or an article: scroll to the **News & articles** panel and click **+ Add news / article**. Fill in the title, a short excerpt (shown on the news list), and the full text in English and Khmer. Optionally upload a cover photo, and optionally add a video — either paste a YouTube/Facebook/Vimeo link, or upload a short video file directly. If you added a cover photo or video file, click **Save uploaded news media** first, then click **Save changes** below to publish the article text. Uncheck **Published** to keep an article as a private draft (use **Preview article** to check it before publishing).
8. Click **Save changes** for any content edits. The live site updates automatically within a minute or two.

## Making changes via code instead

This is still a static site — no build step. Edit `data.json` (or `index.html` for structural/design changes) directly, then commit and push; GitHub Pages redeploys automatically.
