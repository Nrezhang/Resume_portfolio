# Henry Zhang Portfolio

A routed React portfolio with an authenticated content editor and a small Node.js API.

## Local development

Run both the React client and API from the repository root:

```bash
npm run dev
```

The portfolio runs at `http://127.0.0.1:3000` and the API runs at `http://127.0.0.1:8080`.

The public sections use regular browser routes such as `/profile`, `/projects`, and `/experience`. The content editor is available at `/admin` and uses Google sign-in. Set `GOOGLE_CLIENT_ID`, `REACT_APP_GOOGLE_CLIENT_ID`, and `ADMIN_EMAILS` in `.env` before signing in locally. `ADMIN_EMAILS` is a comma-separated server-side allowlist; the template includes `henryszhang83@gmail.com` and `hsz2011@nyu.edu`.

Create a Google Cloud OAuth client of type **Web application** and add `http://127.0.0.1:3000`, `http://localhost:3000`, and `https://www.henryszhang.dev` under **Authorized JavaScript origins**. Use its client ID for both Google client ID variables. The AWS deployment reads the same client ID and allowlist from its existing admin secret; see `infra/README.md` for the secret format.

The editor is a themed Portfolio studio inside the public app shell, with a homepage preview and separate content sections. Projects, experience entries, education entries, skill groups, and individual skills can be added, edited, or removed before publishing the complete draft.

Editable content is persisted to DynamoDB in production and `server/data/content.json` locally. Seed the production document once with `npm run seed:content`; the command is idempotent and will not overwrite existing published content unless you explicitly run `npm run seed:content -- --force`.

The bundled `client/src/content/defaultContent.json` remains an emergency fallback for public reads when the API is unavailable. It keeps the portfolio visible during a transient API failure, but published DynamoDB content is the production source of truth.

### Production-content preview and releases

Run `npm run dev:production-content` to preview local code against **live published content** at `http://127.0.0.1:3001` (read-only proxy on 8081). Normal local development remains on 3000/8080. The preview blocks the editor, authentication, and writes in both the client and proxy. It deliberately shows an error instead of bundled fallback content if production cannot be reached. It needs no AWS credentials. This checks content parity with local code, not the deployed build itself.

Content and assets have separate release paths: deploying React uploads its imported assets to S3 but does not publish JSON changes to DynamoDB. For content/media changes, add a new immutable `content-migrations/*.json` release plan with a reason, targeted before/after field patches, and expected asset names. An empty patch list is allowed for asset-only changes with an explanation. Never force-seed production to deploy a small update.

1. Run `npm run content:migrate -- content-migrations/NAME.json` for a read-only AWS dry run. Unexpected values stop the migration for manual review.
2. Run the same command with `--apply` after review. It saves the complete DynamoDB item under gitignored `.content-backups/` (private permissions), conditionally writes only if the fetched content is unchanged, and reads back to verify. Other content and item attributes are retained. Reapplying is a no-op.
3. CI requires a new release plan when tracked content, editor schemas, or assets change. Deploy is blocked until that release’s targeted content values are published. After requesting CloudFront invalidation, bounded retries check public content, the exact deployed asset manifest against the build, and media/JS/CSS URL availability. The job fails if propagation or verification does not succeed. It does not need CloudFront polling permissions or any new AWS permissions.

For incompatible schema changes, deploy backward-compatible readers first, then migrate, then remove compatibility in a later release. Do not mutate old migration files. Backups contain an `Item` wrapper; restore only after comparing with current content so newer admin changes are not erased. Keep the backup outside git and retain it until the release is verified.

#### What the admin does and does not update automatically

- Published experience entries feed the experience list and branch timeline. Use full-month date ranges such as `June 2026 – Present`; the current timeline parses display text, not structured date fields.
- Globe coordinates are still mapped by entry ID in `ExperienceTimeline.js`. A new role uses a neutral globe view without a pin until its location mapping is added. Editing the location label alone does not geocode it.
- Homepage Currently currently selects the `treasury` record by ID. The text and logo are editable, but a new current job does not replace that selection automatically.
- Homepage Selected work selects Inyo/MyDian. The Projects quick action selects Inyo/LLaMA/MyDian; selection, order, short titles, and summaries live in `HomePage.js` and `PortfolioCards.js`, not the editor.
- New logos can use an existing catalog key or an already-deployed URL in the experience editor. The editor does not upload files. New bundled assets require a code deployment; changing a JSON reference alone does not upload an asset.

For every future update: decide whether it is a **content publish**, a **code/asset deployment**, or both. Preview with production content, check the affected detail page and homepage, and verify the live page after publishing. Until the hard-coded settings above are moved into the content schema, changes to them still need a code release. CI checks are deployment gates; repository branch-protection rules must also require CI if merges themselves should be blocked.

## Chat-first portfolio

The public app uses a persistent sidebar and a chat homepage. `/profile`, `/projects`, `/projects/:projectId`, `/experience`, `/resume`, and `/admin` open dedicated views in the same shell. The experience page reuses the globe, branch timeline, work history, and education components. The content API, DynamoDB publishing path, and admin authentication remain in use.

- `client/src/services/chatProvider.js` defines the demo response provider. Replace or inject a provider into `ChatProvider` with the contract `respond({ messages }) => Promise<{ text, label }>`. Connect a backend endpoint here for persona/RAG; keep API credentials on the server. Pending and failure states are already handled.
- Visitor conversations are stored only in this tab's `sessionStorage` under `henry-portfolio-conversations-v1`, capped at 20 conversations. They are not sent to the portfolio content API. New chat starts a fresh thread; the recent list reopens previous threads in the browser session.
- Homepage previews read from `ContentContext`, including remote published content. A compact Currently section shows the Treasury role and links directly to its experience details. A separate Selected Work section below contains Inyo and MyDian. The Projects quick action highlights Inyo, LLaMA fine-tuning, and MyDian through `components/chat/PortfolioCards.js`. Entries appear only when their content records exist. Product thumbnails without dedicated assets use labeled preview placeholders; missing projects are not shown as invented entries.
- The homepage uses the name-first design with a one-time typing animation for the software-engineer role. The animation reserves text width to avoid layout shifts, presents complete text to screen readers, and respects reduced motion. Edit `profile.heroRole` and `profile.heroDescription` in Portfolio studio; existing documents use sensible defaults until published.
- The sidebar uses Henry's existing profile photo. Click it to open Settings: appearance, session usage, and the admin link. Light, Dark, and System preferences persist under `portfolio-theme`; a new visitor defaults to Dark. GitHub and LinkedIn use configured profile destinations, and Resume uses the existing bundled document.
- The sidebar brand reuses the master favicon. Experience logos use the content-owned `media.logo` shape rather than component-specific fields; see [media assets](docs/media-assets.md) for its schema and the S3/CloudFront deployment path.
- Session usage is a demo display, with messages tracked per tab session and zero paid AI tokens. Future server-enforced message/token budgets and spending controls are specified in [AI usage limits](docs/ai-usage-limits.md). The admin AI usage section is a clearly labeled preview until that backend is implemented.
- Run `CI=true npm --prefix client test -- --watchAll=false`, `npm run test:api`, and `npm run build` for checks. The chat interaction tests cover all four expanded states, draft preservation, Escape/focus restoration, submission, recent conversations, and internal routing.
