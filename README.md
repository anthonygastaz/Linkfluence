

## Local development

```bash
npm install
cp .env.example .env   # add Supabase keys
npm run dev            # http://localhost:3000
```

Admin panel: `/admin`

## Deploy to Vercel

1. Import the repo in [Vercel](https://vercel.com) (uses `vercel.json` automatically).
2. Set environment variables:

| Variable | Required |
| --- | --- |
| `VITE_SUPABASE_URL` | Yes |
| `VITE_SUPABASE_ANON_KEY` | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin KYC previews |

3. Deploy. Node **20.x** is pinned via `package.json` / `.nvmrc`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Local Express + Vite |
| `npm run build:vercel` | Production frontend (Vercel) |
| `npm run build` | Frontend + Node server bundle |
| `npm run lint` | TypeScript check |

## Fonts

Add TT Norms Pro to `public/fonts/` (`tt-norms-pro-regular.woff2`, `tt-norms-pro-semibold.woff2`).  
Inter loads from Google Fonts as fallback.
