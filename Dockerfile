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
ARG VITE_API_BASE_URL
ARG VITE_STRIPE_PUBLISHABLE_KEY
ARG VITE_PAYMENT_FORM_CARD_ID
ARG VITE_PAYMENT_ID_START
ARG VITE_PAYMENT_PLAN_WEEKDAY_ID
ARG VITE_PAYMENT_PLAN_SATURDAY_ID
ARG VITE_PAYMENT_PLAN_SUNDAY_ID
ARG VITE_PAYMENT_PLAN_MATUTINO_CARRO_ID
ARG VITE_PAYMENT_PLAN_MATUTINO_MOTO_ID
ARG VITE_PAYMENT_PLAN_VESPERTINO_CARRO_ID
ARG VITE_PAYMENT_PLAN_VESPERTINO_MOTO_ID
RUN { \
      if [ -n "$VITE_API_BASE_URL" ]; then echo "VITE_API_BASE_URL=$VITE_API_BASE_URL"; fi; \
      if [ -n "$VITE_STRIPE_PUBLISHABLE_KEY" ]; then echo "VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY"; fi; \
      if [ -n "$VITE_PAYMENT_FORM_CARD_ID" ]; then echo "VITE_PAYMENT_FORM_CARD_ID=$VITE_PAYMENT_FORM_CARD_ID"; fi; \
      if [ -n "$VITE_PAYMENT_ID_START" ]; then echo "VITE_PAYMENT_ID_START=$VITE_PAYMENT_ID_START"; fi; \
      if [ -n "$VITE_PAYMENT_PLAN_WEEKDAY_ID" ]; then echo "VITE_PAYMENT_PLAN_WEEKDAY_ID=$VITE_PAYMENT_PLAN_WEEKDAY_ID"; fi; \
      if [ -n "$VITE_PAYMENT_PLAN_SATURDAY_ID" ]; then echo "VITE_PAYMENT_PLAN_SATURDAY_ID=$VITE_PAYMENT_PLAN_SATURDAY_ID"; fi; \
      if [ -n "$VITE_PAYMENT_PLAN_SUNDAY_ID" ]; then echo "VITE_PAYMENT_PLAN_SUNDAY_ID=$VITE_PAYMENT_PLAN_SUNDAY_ID"; fi; \
      if [ -n "$VITE_PAYMENT_PLAN_MATUTINO_CARRO_ID" ]; then echo "VITE_PAYMENT_PLAN_MATUTINO_CARRO_ID=$VITE_PAYMENT_PLAN_MATUTINO_CARRO_ID"; fi; \
      if [ -n "$VITE_PAYMENT_PLAN_MATUTINO_MOTO_ID" ]; then echo "VITE_PAYMENT_PLAN_MATUTINO_MOTO_ID=$VITE_PAYMENT_PLAN_MATUTINO_MOTO_ID"; fi; \
      if [ -n "$VITE_PAYMENT_PLAN_VESPERTINO_CARRO_ID" ]; then echo "VITE_PAYMENT_PLAN_VESPERTINO_CARRO_ID=$VITE_PAYMENT_PLAN_VESPERTINO_CARRO_ID"; fi; \
      if [ -n "$VITE_PAYMENT_PLAN_VESPERTINO_MOTO_ID" ]; then echo "VITE_PAYMENT_PLAN_VESPERTINO_MOTO_ID=$VITE_PAYMENT_PLAN_VESPERTINO_MOTO_ID"; fi; \
    } > .env

RUN npm run build

# production image
FROM nginx:stable-alpine AS runner
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# optional: custom nginx conf (gzip, cache headers) para mejorar performance
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
