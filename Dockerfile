ARG BASE_IMAGE=node:16-alpine 

# Builder
FROM $BASE_IMAGE as deployer

RUN apk add --no-cache curl git

RUN corepack enable

RUN corepack prepare pnpm@7.9.1 --activate

WORKDIR /repo

COPY pnpm-lock.yaml ./

RUN pnpm fetch

COPY . .

RUN pnpm install -r --offline --ignore-scripts

RUN pnpm run build 

FROM nginx:alpine AS runner

COPY --from=deployer /repo/dist /usr/share/nginx/html

EXPOSE 80