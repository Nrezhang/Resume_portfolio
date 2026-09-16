# Henry Zhang Portfolio

A routed React portfolio with an authenticated content editor and a small Node.js API.

## Local development

Run both the React client and API from the repository root:

```bash
npm run dev
```

The portfolio runs at `http://127.0.0.1:3000` and the API runs at `http://127.0.0.1:8080`.

The public sections use regular browser routes such as `/profile`, `/projects`, and `/experience`. The content editor is available at `/admin` and uses Google sign-in. Set `GOOGLE_CLIENT_ID`, `REACT_APP_GOOGLE_CLIENT_ID`, and `ADMIN_EMAILS` in `.env` before signing in locally. `ADMIN_EMAILS` is a comma-separated server-side allowlist; the template includes `henryszhang83@gmail.com` and `hsz2011@nyu.edu`.

Create a Google Cloud OAuth client of type **Web application** and add `http://127.0.0.1:3000`, `http://localhost:3000`, and your deployed site origin under **Authorized JavaScript origins**. Use its client ID for both Google client ID variables. The AWS deployment reads the same client ID and allowlist from its existing admin secret; see `infra/README.md` for the secret format.

The editor is a live preview of the public portfolio. Projects, experience entries, education entries, skill groups, and individual skills can be added, edited, or removed before publishing the complete draft.

Editable content is persisted to `server/data/content.json`. Until the first save, the API reads the checked-in defaults from `client/src/content/defaultContent.json`.
