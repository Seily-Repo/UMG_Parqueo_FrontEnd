# frontend/Dockerfile
# Habilitar sintaxis BuildKit (opcional, mejora mounts de cache)
# syntax=docker/dockerfile:1.4

FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# copio package files primero para cachear instalación
COPY package*.json ./

# cache npm para acelerar reinstalaciones (BuildKit needed)
# this uses BuildKit mount type=cache to cache ~/.npm
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

COPY . .

# Si necesitas variables en build, podrías pasar ARGs y crear .env
ARG REACT_APP_API_URL
RUN if [ -n "$REACT_APP_API_URL" ]; then echo "VITE_API_URL=$REACT_APP_API_URL" > .env; fi

RUN npm run build

# production image
FROM nginx:stable-alpine AS runner
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# optional: custom nginx conf (gzip, cache headers) para mejorar performance
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]