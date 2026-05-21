# frontend/disponibilidad/Dockerfile
# syntax=docker/dockerfile:1.4

FROM node:18-alpine AS builder
WORKDIR /usr/src/app

COPY package*.json ./

RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

COPY . .

ARG REACT_APP_API_URL
ARG REACT_APP_LOGIN_URL
ARG REACT_APP_LOGIN_ADMIN_URL
ARG REACT_APP_ID_CICLO
ARG REACT_APP_ID_JORNADA

RUN echo "REACT_APP_API_URL=${REACT_APP_API_URL}" > .env && \
    echo "REACT_APP_LOGIN_URL=${REACT_APP_LOGIN_URL}" >> .env && \
    echo "REACT_APP_LOGIN_ADMIN_URL=${REACT_APP_LOGIN_ADMIN_URL}" >> .env && \
    echo "REACT_APP_ID_CICLO=${REACT_APP_ID_CICLO:-1}" >> .env && \
    echo "REACT_APP_ID_JORNADA=${REACT_APP_ID_JORNADA:-1}" >> .env

RUN npm run build

FROM nginx:stable-alpine AS runner
COPY --from=builder /usr/src/app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
