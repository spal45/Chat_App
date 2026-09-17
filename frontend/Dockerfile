FROM node:20-alpine AS build
WORKDIR /app

# Next.js inlines NEXT_PUBLIC_* vars into the client bundle at build time,
# not at container start - they must be passed as build args (which
# Railway/most platforms auto-populate from service variables of the same
# name, but only for ARGs the Dockerfile actually declares).
ARG NEXT_PUBLIC_USER_SERVICE_URL
ARG NEXT_PUBLIC_CHAT_SERVICE_URL
ENV NEXT_PUBLIC_USER_SERVICE_URL=$NEXT_PUBLIC_USER_SERVICE_URL
ENV NEXT_PUBLIC_CHAT_SERVICE_URL=$NEXT_PUBLIC_CHAT_SERVICE_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/public ./public
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
