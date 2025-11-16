# Test container for dev/pro

This repository includes a minimal Express app under `004_test_container_dev_pro/`. We use it solely to verify that the app work correctly in development and production:

- Work in development:
- [006_up_development_application](./006_up_development_application.md)

- Work in production:
- [007_github_actions](./007_github_actions.md)

---

## Index

1. [Dockerfile overview](#1-dockerfile-overview)
2. [Container environment variables](#2-container-environment-variables)
3. [Dev watch mode](#3-dev-watch-mode)
4. [docker-compose service](#4-docker-compose-service)
5. [Next step](#5-next-step)

---

## 1 Dockerfile overview

- `FROM node:20-alpine` keeps the image small and consistent across environments.
- `ARG APP_PORT` → `ENV PORT` ensures the same port value is embedded at build time.
- `npm install --production` installs only runtime deps; build remains identical for dev and prod.
- `CMD ["sh","-c","npm run ${COMMAND:-start}"]` lets `.env.*` decide whether to run `dev` or `start`.

## 2 Container environment variables

All values come from `.env.development` or `.env.production`:

- `ENVIRONMENT`: informs the app (`development` vs `production`).
- `COMMAND`: `dev` for local watch mode, `start` on the server.
- `PORT_004_TEST_CONTAINER_DEV_PRO`: external/internal port.
- `BASE_URL`: exposes the local URL or prod domain.
- `DEV_CODE_VOLUME_*` and `NODE_MODULES_VOLUME_*`: map host paths and named volumes.

## 3 Dev watch mode

- `package.json` defines `npm run dev` as `NODE_ENV=development node --watch server.js`.
- `node --watch` (Node 20+) reloads automatically when code changes inside the container.
- We avoid extra dev dependencies (nodemon) while keeping the same command interface.

## 4 docker-compose service

`docker-compose.yml` defines the `hello-world` service with:

- build context `./004_test_container_dev_pro`
- build arg `APP_PORT=${PORT_004_TEST_CONTAINER_DEV_PRO}`
- container name `hello_world_app`
- port mapping `${PORT_004_TEST_CONTAINER_DEV_PRO}:${PORT_004_TEST_CONTAINER_DEV_PRO}`
- environment values driven by `.env.*` (`ENVIRONMENT`, `COMMAND`, `BASE_URL`, `PORT_004_TEST_CONTAINER_DEV_PRO`)
- bind mounts/named volumes defined through `DEV_CODE_VOLUME_*` and `NODE_MODULES_VOLUME_*`

Switch between `.env.development` and `.env.production` to control ports, commands, and volume paths without touching `docker-compose.yml`.

## 5 Next step

- [006_up_development_application](./006_up_development_application.md)
