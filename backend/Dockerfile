# --- Build stage ---
FROM node:20-alpine AS build
RUN apk upgrade --no-cache
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

# --- Runtime stage ---
FROM node:20-alpine
RUN apk upgrade --no-cache
WORKDIR /app
ENV NODE_ENV=production

# non-root user
RUN addgroup -S app && adduser -S app -G app

COPY --from=build /app /app
USER app

EXPOSE 3000
CMD ["node", "src/server.js"]