# BeatMarket — Beat Marketplace MVP

A marketplace connecting music producers and artists for beat licensing. Built with Next.js 14, Prisma, NextAuth, TailwindCSS, and Zustand.

## Features

### Producer
- Storefront with profile, social links, and published beats
- Dashboard with revenue, plays, followers, and sales analytics
- Beat upload with genre, mood, BPM, key, tags, and pricing
- Three license tiers: Basic (MP3), Premium (WAV), Exclusive (Stems)

### Artist
- Browse and search beats by genre, mood, tags
- Persistent audio player with queue management
- Checkout flow: license selection → agreement review → payment → download
- Library with licensed beats and downloadable files
- Favorites and follow producers

### Platform
- NextAuth credentials authentication with role-based access
- Messaging between users
- Platform commission: 10% capped at ₹5,000
- Contract/agreement generation per transaction

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TailwindCSS
- **State**: Zustand (audio player)
- **Auth**: NextAuth.js (credentials provider)
- **Database**: SQLite (dev) / PostgreSQL (prod) via Prisma ORM
- **Icons**: Lucide React

## Getting Started

```bash
# Install dependencies
npm install

# Generate Prisma client & push schema
npx prisma generate
npx prisma db push

# Seed demo data
npx tsx prisma/seed.ts

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Producer | rahul@example.com | password123 |
| Producer | priya@example.com | password123 |
| Producer | arjun@example.com | password123 |
| Artist | artist1@example.com | password123 |
| Artist | artist2@example.com | password123 |
| Admin | admin@beatmarket.in | password123 |

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes (auth, beats, orders, favorites, follow, messages)
│   ├── checkout/      # Multi-step checkout flow
│   ├── dashboard/     # Producer dashboard & upload
│   ├── library/       # Artist licensed beats
│   ├── login/         # Login page
│   ├── messages/      # Messaging
│   ├── register/      # Registration with role selection
│   ├── search/        # Search & discovery
│   ├── [username]/    # Producer storefront
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Homepage
├── components/
│   ├── beats/         # BeatCard
│   ├── home/          # HomeBeats
│   ├── layout/        # Navbar, AudioPlayer
│   └── providers/     # SessionProvider
├── lib/               # prisma, auth, utils
└── store/             # Zustand audio player store
prisma/
├── schema.prisma      # Data model
└── seed.ts            # Demo data
```

## MVP Exclusions

- File upload (requires S3/cloud storage)
- Payment gateway integration (Razorpay/PayU)
- Audio preview generation/watermarking
- Native mobile apps
- Advanced DRM / Content ID
- AI recommendations
