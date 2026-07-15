# Backend-only image for Fly.io. The frontend (Vite/React) is built and
# hosted separately on Vercel — this image only runs server/index.js.
FROM node:20-bookworm

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY server ./server

ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

CMD ["node", "server/index.js"]
