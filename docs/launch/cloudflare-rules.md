# Cloudflare setup for themalakestategroup.com

**Canonical domain: `https://themalakestategroup.com` (no www).** `www` must 301 to it. The repo is
already configured for this (`src/data/site.ts` url, `wrangler.jsonc` routes, `dist/_redirects`).

Everything below is done in the Cloudflare dashboard, in this order. Steps 1–3 can happen any time
before launch; steps 4–6 are launch day.

## 1. Add the zone (before launch, no downtime)

1. Cloudflare → **Add a domain** → `themalakestategroup.com` → Free plan is fine.
2. Cloudflare scans the existing DNS. **Before changing nameservers, check the imported records
   match what Wix has today** (especially any `MX`/`TXT` records, e.g. email or Google
   verification). Keep the Wix `A`/`CNAME` records for now so the old site keeps working.
3. At **Wix** (the registrar): Domains → themalakestategroup.com → **Advanced → Change
   nameservers** → enter the two Cloudflare nameservers. Propagation takes minutes to hours; the
   Wix site stays up because the records point to Wix.

## 2. Create the Worker (before launch)

1. Workers & Pages → **Create → Import a repository** → `Apex-Veterinary-Marketing/malak-state`.
2. Build command `npm run build` · Deploy command `npx wrangler deploy` · branch `main`.
3. The Worker's name must equal `"name"` in `wrangler.jsonc` (currently the placeholder
   `skeleton`). Tell me the name you choose and I'll update the repo.
4. For the client review link, add the build variable `SITE_URL` = the `workers.dev` address (the
   preview is then noindexed). **Note:** `wrangler.jsonc` already lists the custom domains; the first
   deploy will try to attach them. Until launch day, deploy from a branch without the `routes`
   block, or ask me to hold the routes back until launch.

## 3. SSL/TLS (before launch)

- SSL/TLS → Overview → **Full**.
- SSL/TLS → Edge Certificates → **Always Use HTTPS: On**.

## 4. Launch: point the domain at the Worker

1. DNS: **delete** the Wix `A` record for `themalakestategroup.com` and the `CNAME` for `www`
   (custom domains can't attach while conflicting records exist).
2. Workers → the Worker → Settings → **Domains & Routes**: confirm both custom domains are
   attached (`themalakestategroup.com` and `www.themalakestategroup.com`). They attach on deploy
   from `wrangler.jsonc`, or add them here.
3. Remove the `SITE_URL` build variable and redeploy.

## 5. Launch: Redirect Rule, www → apex (the only rule you add)

Rules → **Redirect Rules** → Create rule:

| Field | Value |
|---|---|
| Rule name | `www to apex` |
| When incoming requests match | Custom filter expression: **Hostname** *equals* `www.themalakestategroup.com` |
| Then | **Dynamic** |
| Expression | `concat("https://themalakestategroup.com", http.request.uri.path)` |
| Status code | **301** |
| Preserve query string | **On** |

(Equivalent: the "Redirect from WWW to root" template.)

**Old Wix URLs need no dashboard rules.** Their 301s ship with the site in `dist/_redirects`,
generated from `astro.config.mjs` (full list: `docs/launch/redirect-map.csv`). An old
`www.themalakestategroup.com/buy` link goes www → apex (this rule), then `/buy` →
`/services/buying-a-home/` (the site), both 301s.

## 6. Launch: checks and Google

Run these after DNS settles. Each should show the status and destination noted:

```
curl -sI https://www.themalakestategroup.com/        → 301, location: https://themalakestategroup.com/
curl -sI https://themalakestategroup.com/            → 200
curl -sI https://themalakestategroup.com/buy         → 301, location: /services/buying-a-home/
curl -sI https://www.themalakestategroup.com/sell    → 301 to apex, then 301 to /services/selling-your-home/
curl -sI https://themalakestategroup.com/sitemap.xml → 200
curl -sI https://themalakestategroup.com/robots.txt  → 200
```

- Google Search Console: add a **Domain property** for `themalakestategroup.com` (DNS TXT record in
  Cloudflare), which covers www and apex. Submit `https://themalakestategroup.com/sitemap.xml`.
- GitHub repo → Settings → Secrets → `DEPLOY_HOOK_URL` (Workers deploy hook), so the weekly
  rebuild publishes scheduled blog posts.
- Refresh share previews (Facebook Sharing Debugger, LinkedIn Post Inspector) only **after** DNS
  points to the new site.
