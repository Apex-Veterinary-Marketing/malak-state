# Blog Post Contract

The one format every Skeleton site accepts for blog posts, whether a person writes the post or
an automation (Zapier, Make, n8n, a custom script) publishes it through the GitHub API. It is
the same in every client repo, even when the site calls the blog "Resources", "Articles" or
anything else. Only the public URL changes; the files never move.

`npm run check:posts` validates every post against this contract (it's part of `npm run
verify`, and `.github/workflows/check-posts.yml` runs it on every pull request that touches posts).

## Where things go

| What | Path in the repo | Rules |
|---|---|---|
| Post | `src/content/blog/<slug>.md` | One file per post, directly in that folder (no sub-folders). |
| Post image | `src/assets/blog/<slug>.<ext>` | `.jpg`, `.png`, `.webp` or `.avif`; ideally ≥ 1600 px wide; the site resizes and crops it. |
| Categories | `src/content/blog-categories/<id>.md` | Posts can only use ids that exist here. |

**`<slug>`** is the post's URL name: lowercase letters, digits and single hyphens, e.g.
`hot-pavement-miami-dog-walks`. It must be unique; re-using a slug overwrites that post.

The public URL is `<BLOG_BASE>/<slug>`, where `BLOG_BASE` is set in `src/lib/data/blog.ts`
(`/blog` by default, `/resources` on MK9). Automations never need it.

## The file

```markdown
---
name: "Hot Pavement and Miami Walks: Protecting Your Dog's Paws"
pubDate: 2026-11-26
draft: false
titleTag: "Hot Pavement & Dog Paws: Miami Walking Guide"
metaDescription: "At 77°F air, asphalt can reach 125°F. The 7-second test and the safest walk times."
postSummary: "Miami pavement gets hotter than the air. Here's how to keep your dog's paws safe."
postThumbnail: "../../assets/blog/hot-pavement-miami-dog-walks.jpg"
thumbnailAlt: "Dog walking on a shaded park path"
authorName: "MK9 Specialists"
category: ["miami-dog-life"]
readTime: "4 min read"
keyTakeaways:
  - "At an air temperature of 77°F, asphalt can reach 125°F. [1]"
sources:
  - text: "Washington State University (2017). Protect pets' feet from heat."
    url: "https://archive.news.wsu.edu/press-release/2017/07/06/protect-pets-feet-from-heat/"
featured: false
---

Opening paragraph. No `#` heading here: the title comes from `name`.

## First section

Text with a citation.<sup class="cite"><a href="#source-1">[1]</a></sup>
```

## Fields

| Field | Required | Type / format | Notes |
|---|---|---|---|
| `name` | **yes** | text | The title (page H1). |
| `pubDate` | **yes** | `YYYY-MM-DD` | A future date = scheduled: hidden until the first build on or after that day. |
| `draft` | no | `true` / `false` (default `false`) | `true` = never published, whatever the date. Use it for posts waiting on approval. |
| `titleTag` | no | text ≤ 60 chars | Google title; falls back to `name`. |
| `metaDescription` | no (expected) | text ≤ 160 chars | Google description. |
| `postSummary` | no | text | Card excerpt on the listing page. |
| `postThumbnail` | no (expected) | `"../../assets/blog/<file>"` | Must exist in `src/assets/blog/`. Upload the image first. |
| `thumbnailAlt` | with an image | text | Describe the image. |
| `author` | no | a `src/content/brokers/` id | Only when an agent wrote it; links to their `/agents/<id>` page. (This real estate fork renamed the template's `doctors` collection to `brokers`; the field name is unchanged.) |
| `authorName` | no | text | Plain byline when there's no agent author. |
| `category` | no | list of category ids | Ids must exist in `src/content/blog-categories/`. |
| `readTime` | no | text, e.g. `"5 min read"` | |
| `keyTakeaways` | no | list of text | Shown as a summary box where the design has one. |
| `sources` | no | list of `{ text, url }` | `url` must be `http(s)`. Cite as `[n]` in the body. |
| `featured` | no | `true` / `false` | Highlights the post on the listing page. |

A client site may add its own **optional** fields (MK9 adds `relatedProgram`,
`relatedInsightAnchor`, `reviewedBy`). No site may rename or remove a field above or make an
optional one required: that would break every automation already publishing to it.

## Body

Markdown. Sections start at `##` (`###` for sub-sections). Links, lists, bold/italic, and inline
HTML for citations (`<sup class="cite"><a href="#source-1">[1]</a></sup>`) are fine. No `#` H1,
no `<script>`, no inline styles. Link to other posts with `<BLOG_BASE>/<slug>`; a link to a
post that isn't live yet shows as plain text until it is.

## Publishing flow (for automations)

Fully automatic: the automation commits straight to `main`. No branch, no pull request, no
review step.

1. **Validate before sending** (in the automation): slug format, `pubDate` as `YYYY-MM-DD`,
   category ids from the list above, image present and under 2 MB.
2. **Commit the image and the post to `main`** — preferably **in one commit** with GitHub's
   GraphQL `createCommitOnBranch` (both files base64, `expectedHeadOid` = the current `main`
   commit), so the site never sees a post without its image. With the REST contents API
   (one file per call) upload the **image first**, then the post.
3. **Cloudflare builds and deploys `main`** within minutes. A future `pubDate` stays hidden until
   the first build on or after that date (the weekly `.github/workflows/scheduled-publish.yml`
   rebuild). `draft: true` never publishes.

Safety net: `check-posts` runs on every push to `main` that touches the blog and fails, with a
GitHub notification, when a post breaks this contract. A post that fails also fails
Cloudflare's build, so the live site keeps its last good version until the post is fixed or
removed. If two posts are sent at the same moment, a stale `expectedHeadOid` (or a 409 from the
REST API) means `main` moved: re-read it and retry.
