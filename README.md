# Vudio API

Multi-brand AI marketing backend — powers the Muffyn Dashboard.

## Stack

- **Node.js** (ES Modules) + **Express 4**
- **MongoDB** + **Mongoose 8**
- **JWT** access tokens (15min) + **httpOnly cookie** refresh tokens (30d, rotation pattern)
- **Anthropic claude-sonnet-4** for AI page generation
- **Joi** validation · **helmet** · **express-rate-limit**

## Quick start

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env
# — fill in MONGO_URI, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, ANTHROPIC_API_KEY

# 3. Run dev server (nodemon)
npm run dev

# 4. Check health
curl http://localhost:5000/health
```

## Architecture

```
src/
├── config/          env.js · db.js · cors.js
├── constants/       ROLES · PLAN_LIMITS · enums
├── models/          11 Mongoose models (see below)
├── services/        token · auth · ai
├── middlewares/     authenticate · authorize · checkBrandAccess · validate · rateLimiter · errorHandler
├── validators/      Joi schemas per resource
├── controllers/     auth · brand · page · video · lead · dashboard · ai
└── routes/v1/       auth · brand · page · video · lead · ai · dashboard
```

## Data model (10 collections)

| Collection | Purpose |
|---|---|
| `organizations` | Top-level company account |
| `brands` | Sub-brands scoped to an org |
| `users` | Auth accounts scoped to an org |
| `user_brands` | User ↔ Brand membership + role |
| `refresh_tokens` | Rotation-pattern tokens, TTL auto-expire |
| `brand_kits` | Colors, fonts, logos per brand |
| `pages` | AI-generated SEO pages |
| `videos` | Video assets |
| `leads` | CRM contacts with source tracking |
| `lead_activities` | Audit trail per lead |
| `lead_notes` | Free-text notes per lead |

## Role matrix

| Role | Access |
|---|---|
| `ORG_ADMIN` | All brands in org, user management |
| `BRAND_ADMIN` | Assigned brands via `user_brands` junction |
| `VIEWER` | Read-only on assigned brands |

## API reference

### Auth
```
POST   /api/v1/auth/signup       { orgName, name, email, password }
POST   /api/v1/auth/login        { email, password }
POST   /api/v1/auth/refresh      (reads httpOnly cookie)
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
PUT    /api/v1/auth/me           { name, avatarUrl }
```

### Brands
```
GET    /api/v1/brands
POST   /api/v1/brands            ORG_ADMIN only
GET    /api/v1/brands/:brandId
PUT    /api/v1/brands/:brandId   ORG_ADMIN only
DELETE /api/v1/brands/:brandId   ORG_ADMIN only (soft delete)
GET    /api/v1/brands/:brandId/kit
PUT    /api/v1/brands/:brandId/kit
GET    /api/v1/brands/:brandId/members
POST   /api/v1/brands/:brandId/members
GET    /api/v1/brands/:brandId/dashboard
```

### Pages, Videos  (identical pattern)
```
GET    /api/v1/brands/:brandId/pages          ?status=&category=&search=&from=&to=&page=&limit=
POST   /api/v1/brands/:brandId/pages
GET    /api/v1/brands/:brandId/pages/:id
PUT    /api/v1/brands/:brandId/pages/:id
DELETE /api/v1/brands/:brandId/pages/:id
POST   /api/v1/brands/:brandId/pages/:id/publish
POST   /api/v1/brands/:brandId/pages/:id/unpublish
```

### Leads
```
GET    /api/v1/brands/:brandId/leads          ?status=&intent=&search=&page=&limit=
POST   /api/v1/brands/:brandId/leads
GET    /api/v1/brands/:brandId/leads/:id
PUT    /api/v1/brands/:brandId/leads/:id
DELETE /api/v1/brands/:brandId/leads/:id
PATCH  /api/v1/brands/:brandId/leads/:id/status
GET    /api/v1/brands/:brandId/leads/:id/activities
POST   /api/v1/brands/:brandId/leads/:id/notes
```

### AI (stateless — does NOT save to DB)
```
POST   /api/v1/ai/generate-page  { keyword, category, brandId }
→ { title, slug, content, word_count, read_time_minutes, seo_score, internal_links }
```

## Rate limits

| Tier | Limit |
|---|---|
| Global | 200 req / 15 min |
| Auth endpoints | 10 req / 15 min |
| AI generation | 5 req / min |

## Integration checklist (dashboard)

1. On signup → `POST /auth/signup` → store `accessToken` in memory, refresh token is auto-set as httpOnly cookie
2. On every request → `Authorization: Bearer <accessToken>` header
3. On 401 → call `POST /auth/refresh` → get new `accessToken` → retry original request
4. Brand switcher → `GET /brands` → switch `brandId` in app state
5. Create Page flow → `POST /ai/generate-page` → show review screen → `POST /brands/:id/pages`

## Environment variables

| Key | Required | Description |
|---|---|---|
| `MONGO_URI` | ✅ | MongoDB connection string |
| `ACCESS_TOKEN_SECRET` | ✅ | JWT signing secret (min 64 chars) |
| `REFRESH_TOKEN_SECRET` | ✅ | Refresh token secret (different from above) |
| `ANTHROPIC_API_KEY` | For AI | `sk-ant-api03-...` |
| `CLIENT_URL` | | CORS origin (default: `http://localhost:3000`) |
| `PORT` | | Server port (default: `5000`) |
| `NODE_ENV` | | `development` / `production` |

Generate secrets with: `openssl rand -hex 64`
