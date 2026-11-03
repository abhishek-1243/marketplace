# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS base
RUN apk add --no-cache openssl

FROM base AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build
ENV NEXTAUTH_URL=http://localhost:3000
ENV NEXTAUTH_SECRET=build-only-secret-at-least-32-characters-long
ENV APP_URL=http://localhost:3000
ENV GOOGLE_CLIENT_ID=build-client
ENV GOOGLE_CLIENT_SECRET=build-secret
ENV AWS_REGION=ap-south-1
ENV AWS_ACCESS_KEY_ID=build-key
ENV AWS_SECRET_ACCESS_KEY=build-secret
ENV AWS_S3_MEDIA_BUCKET=build-bucket
ENV AWS_CLOUDFRONT_URL=https://media.example.com
ENV AWS_SES_FROM_EMAIL=build@example.com
ENV PAYMENTS_ENABLED=false
ENV COMMERCE_LAUNCH_APPROVED=false
ARG NEXT_PUBLIC_SUPPORT_EMAIL
ENV NEXT_PUBLIC_SUPPORT_EMAIL=$NEXT_PUBLIC_SUPPORT_EMAIL
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 CMD wget -q -O - http://127.0.0.1:3000/api/health || exit 1
CMD ["node", "server.js"]
