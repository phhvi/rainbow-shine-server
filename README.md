# Rainbow Shine — API

NestJS + TypeORM + PostgreSQL backend for Rainbow Shine, an app for pinning memories on a map.
Frontend lives in [rainbow-shine-client](https://github.com/phhvi/rainbow-shine-client).

## Local development

Prerequisites: Node 20+, Docker.

```bash
cp .env.example .env        # defaults match docker-compose.yml
docker compose up -d        # starts PostgreSQL on localhost:5432
npm install
npm run start:dev           # API on http://localhost:8000/api
```

Useful commands:

```bash
docker compose ps           # is the DB up?
docker compose logs -f db   # DB logs
docker compose down         # stop (data kept in the db-data volume)
docker compose down -v      # stop AND wipe data
```

## Environment variables

| Name            | Purpose                                              | Default (local)                                        |
| --------------- | ---------------------------------------------------- | ------------------------------------------------------ |
| `DATABASE_URL`  | Postgres connection string                           | `postgres://rainbow:rainbow@localhost:5432/rainbow_shine` |
| `DATABASE_SSL`  | `true` for hosted DBs that require TLS (Neon, etc.)  | `false`                                                |
| `PORT`          | HTTP port                                            | `8000`                                                 |
| `CLIENT_ORIGIN` | Allowed CORS origin                                  | `http://localhost:3000`                                |

## API

| Method | Path                | Description      |
| ------ | ------------------- | ---------------- |
| GET    | `/api/memories`     | List memories    |
| GET    | `/api/memories/:id` | Get one memory   |
| POST   | `/api/memories`     | Create a memory  |
| PATCH  | `/api/memories/:id` | Update a memory  |
| DELETE | `/api/memories/:id` | Delete a memory  |

Memory shape: `{ id, title, description, date, latitude, longitude, createdAt, updatedAt }`.

## Scripts

`npm run start:dev` (watch) · `npm run build` · `npm run lint` · `npm test`
