# Meatika Trading Affiliate

Single-page forex & crypto partnership hub for Meatika Trading — broker links, community channels, and support, with light/dark theme and English/Khmer language toggle.

## Live site

Once GitHub Pages is enabled (see below), the site will be available at:

```
https://<your-username>.github.io/<repo-name>/
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
index.html              Main page (single-file HTML/CSS/JS)
favicon.ico              Multi-size favicon
assets/
  mth-logo.png            Logo — light theme variant
  mth-logo-white.png       Logo — dark theme variant
  favicon-16x16.png        Favicon
  favicon-32x32.png        Favicon
  favicon-48x48.png        Favicon
  apple-touch-icon.png     iOS home screen icon
```

## Making changes

This is a static site — no build step. Edit `index.html` directly, then commit and push; GitHub Pages redeploys automatically.
