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

## Chat-first portfolio

The public app uses a persistent sidebar and a chat homepage. `/profile`, `/projects`, `/projects/:projectId`, `/experience`, `/resume`, and `/admin` open dedicated views in the same shell. The experience page reuses the globe, branch timeline, work history, and education components. The content API, DynamoDB publishing path, and admin authentication remain in use.

- `client/src/services/chatProvider.js` defines the demo response provider. Replace or inject a provider into `ChatProvider` with the contract `respond({ messages }) => Promise<{ text, label }>`. Connect a backend endpoint here for persona/RAG; keep API credentials on the server. Pending and failure states are already handled.
- Visitor conversations are stored only in this tab's `sessionStorage` under `henry-portfolio-conversations-v1`, capped at 20 conversations. They are not sent to the portfolio content API. New chat starts a fresh thread; the recent list reopens previous threads in the browser session.
- Homepage previews read from `ContentContext`, including remote published content. `components/chat/PortfolioCards.js` maps the three featured projects. LearnFromAI has a clearly labeled placeholder until a matching project is added through the existing editor. Product thumbnails without dedicated assets use labeled preview placeholders.
- The homepage uses the name-first design with a one-time typing animation for the software-engineer role. The animation reserves text width to avoid layout shifts, presents complete text to screen readers, and respects reduced motion. Edit `profile.heroRole` and `profile.heroDescription` in Portfolio studio; existing documents use sensible defaults until published.
- The sidebar uses Henry's existing profile photo. Click it to open Settings: appearance, session usage, and the admin link. Light, Dark, and System preferences persist under `portfolio-theme`; a new visitor defaults to Dark. GitHub and LinkedIn use configured profile destinations, and Resume uses the existing bundled document.
- The sidebar brand reuses the master favicon. Experience logos use the content-owned `media.logo` shape rather than component-specific fields; see [media assets](docs/media-assets.md) for its schema and the S3/CloudFront deployment path.
- Session usage is a demo display, with messages tracked per tab session and zero paid AI tokens. Future server-enforced message/token budgets and spending controls are specified in [AI usage limits](docs/ai-usage-limits.md). The admin AI usage section is a clearly labeled preview until that backend is implemented.
- Run `CI=true npm --prefix client test -- --watchAll=false`, `npm run test:api`, and `npm run build` for checks. The chat interaction tests cover all four expanded states, draft preservation, Escape/focus restoration, submission, recent conversations, and internal routing.
