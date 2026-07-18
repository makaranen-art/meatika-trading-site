# Meatika Trading Affiliate

Single-page forex & crypto partnership hub for Meatika Trading — broker links, community channels, and support, with light/dark theme and English/Khmer language toggle.

Site content (links, titles, descriptions, cards, sections) now lives in **`data.json`** and is editable through **`admin.html`** — no code editing required for day-to-day updates.

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
admin.html               Password-gated editor for non-technical admins
data.json                 All editable content: ticker, hero text, sections, cards
favicon.ico               Multi-size favicon
assets/
  icons.js                 Shared icon set used by index.html and admin.html
  mth-logo.png              Logo — light theme variant
  mth-logo-white.png         Logo — dark theme variant
  favicon-16x16.png           Favicon
  favicon-32x32.png           Favicon
  favicon-48x48.png           Favicon
  apple-touch-icon.png        iOS home screen icon
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
5. Click **Save changes**. The live site updates automatically within a minute or two.

## Making changes via code instead

This is still a static site — no build step. Edit `data.json` (or `index.html` for structural/design changes) directly, then commit and push; GitHub Pages redeploys automatically.
