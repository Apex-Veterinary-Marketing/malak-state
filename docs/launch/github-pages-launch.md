# Launch runbook: themalakestategroup.com on GitHub Pages

**Canonical domain: `https://themalakestategroup.com` (no www).** GitHub Pages 301s `www` to it.

**Why GitHub Pages (decided 2026-10-02):** the client keeps the domain at Wix, and Wix won't move the
nameservers to Cloudflare. That means the domain can never be an active zone on Cloudflare, so the Worker
can't serve it. Wix DNS points the domain at GitHub Pages instead. The Cloudflare Worker (`malak-state`)
stays as the noindexed `workers.dev` staging preview.

**Fallback: Cloudflare as production.** The Cloudflare setup is kept intact (`wrangler.jsonc` routes commented
out, `dist/_redirects`). If the domain's DNS can move to Cloudflare, follow `docs/launch/cloudflare-rules.md`,
which starts with the switch steps.

**Repo setup (already done):**
- `.github/workflows/deploy-pages.yml` builds and publishes. It's **off** until the repo variable
  `PAGES_LIVE` is `true`.
- `src/data/site.ts` `url` is the apex.
- Old Wix URLs (`/buy`, `/sell`, …, full list in `docs/launch/redirect-map.csv`) get Astro's meta-refresh
  pages. Pages ignores `dist/_redirects`, so there are no true 301s for them on the live site.

**Known state (2026-10-02):** the domain has **no MX or TXT records**, so changing DNS can't break email
(Marissa's address is on `malakestates.com`) or any verification.

Parts A–C can happen any time before launch. D–G are launch day.

## A. GitHub plan and repo visibility

- The repo is **public** until the org's **GitHub Team** plan is approved. Pages on a private repo needs
  Team (or Enterprise).
- **Activate Team before making the repo private.** On GitHub Free, a private repo turns Pages off and takes
  the live site down. On Team, switching to private changes nothing for visitors.

## B. Protect the domain on GitHub (no effect on the live site)

1. Org page → **Settings** → **Pages** → **Add a domain** → `themalakestategroup.com` → **Add domain**.
   This needs an org owner.
2. GitHub shows a **TXT** record (`_github-pages-challenge-apex-veterinary-marketing...`) and its value.
3. Wix → **Domains** → `themalakestategroup.com` → **⋯** → **Manage DNS Records** → **TXT** →
   **+ Add Record** → paste the name and value → **Save**.
4. **Before changing anything else, screenshot every record on that page.** That's the rollback.
5. Lower the TTL on the root **A** record and the `www` **CNAME** to the lowest option, at least a day
   before launch.
6. Back on GitHub, click **Verify**. Retry after a few minutes if it fails at first.

## C. Ready to launch

1. `npm run check:launch` shows 0 blockers. It always warns that GitHub settings can't be checked from the
   repo; that's expected.
2. `npm run verify` passes.
3. The client has approved the `workers.dev` preview.

## D. Launch: turn on Pages and publish

1. Repo → **Settings** → **Pages** → **Build and deployment** → Source: **GitHub Actions**. Not "Deploy
   from a branch", which would skip the Astro build.
2. Repo → **Settings** → **Secrets and variables** → **Actions** → **Variables** tab →
   **New repository variable**: name `PAGES_LIVE`, value `true`.
3. **Actions** tab → **Deploy to GitHub Pages** → **Run workflow** → **Run workflow**. Setting a variable
   doesn't start a run by itself.
4. Wait for both jobs, **build** and **deploy**, to go green (2–4 min). At this point the site is at
   `apex-veterinary-marketing.github.io/malak-state/` and looks broken there. That's expected; the paths
   assume the site sits at the domain root.

## E. Launch: attach the domain

1. Repo → **Settings** → **Pages** → **Custom domain**: `themalakestategroup.com` (no www) → **Save**. It
   shows a DNS error until step 4 is done.
2. Wix → **Manage DNS Records** → **A (Host)**, the root record (host `@` or blank). Wix may warn that this
   disconnects the Wix site; confirm.
   - Set it to `185.199.108.153`.
   - Add the same host three more times: `185.199.109.153`, `185.199.110.153`, `185.199.111.153`. If Wix
     only allows one A record, keep just the first.
3. Wix → **CNAME** → `www` → `apex-veterinary-marketing.github.io` → **Save**. Leave all other records
   unchanged.
4. GitHub → **Settings** → **Pages**: refresh until it shows **DNS check successful**. This takes minutes,
   up to a few hours.

## F. Launch: HTTPS

1. GitHub issues the certificate after the DNS check passes, usually within an hour. Until then,
   `https://` may show a warning.
2. Tick **Enforce HTTPS**. The checkbox is greyed out until the certificate exists.

## G. Launch: checks and Google

```
curl -sI https://themalakestategroup.com/                     → 200, server: GitHub.com
curl -sI http://themalakestategroup.com/                      → 301 to https://
curl -sI https://www.themalakestategroup.com/                 → 301 to https://themalakestategroup.com/
curl -sI https://themalakestategroup.com/buy                  → 301 to /buy/
curl -s  https://themalakestategroup.com/buy/ | grep refresh  → url=/services/buying-a-home (Pages then adds the /)
curl -sI https://themalakestategroup.com/does-not-exist       → 404 (the site's 404 page)
curl -sI https://themalakestategroup.com/sitemap.xml          → 200
curl -sI https://themalakestategroup.com/robots.txt           → 200
```

- **In a browser, on a phone:** the homepage, a service page, the contact form, `/schedule` (Calendly) and
  the How'd We Do? review link.
- **Google Search Console:** **Add property** → **Domain** → `themalakestategroup.com` → add its TXT record
  in Wix DNS → **Verify** → **Sitemaps** → submit `sitemap.xml`.
- **Share previews:** refresh them (Facebook Sharing Debugger, LinkedIn Post Inspector) only after DNS points
  to the new site.
- **Blog:** publish one post through the issue flow and confirm that **Deploy to GitHub Pages** runs after
  it, triggered by `workflow_run`.

## After launch

- **Publishing:** every push to `main`, every blog post from an issue, and every Thursday at 13:00 UTC
  deploys automatically. **Actions** → **Deploy to GitHub Pages** → **Run workflow** re-publishes on
  demand. A failed build never deploys, so the live site keeps its last good version.
- **Don't set `DEPLOY_HOOK_URL` while on Pages.** `scheduled-publish.yml` would only rebuild the Cloudflare
  preview, and `deploy-pages.yml` has its own weekly cron. Set it only if you switch to the Cloudflare
  fallback.
- **Keep the client's Wix Premium site plan for at least a week** after launch, as the rollback. Keep the
  domain registration on auto-renew; it's billed separately from the site plan.
- **Rollback:** restore the Wix DNS records from the screenshots in B.4 and reconnect the domain to the Wix
  site.
