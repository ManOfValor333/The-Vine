# 🍇 The Vine

A premium church social platform built with Next.js 14, Supabase, and Tailwind CSS.

## Features

- **Posts Feed** - Share thoughts, testimonies, and encouragement
- **Prayer Wall** - Submit and support prayer requests
- **Amen Reactions** - Faith-based reaction system (🙏 Amen, ❤️ Love, 🙌 Praise)
- **Member Profiles** - Connect with your church community
- **Role Badges** - Pastor, Elder, Deacon, Leader, Member

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/the-vine.git
cd the-vine
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL schema (see `database.sql`)
3. Copy your project URL and anon key

### 4. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials.

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

## License

Private - Kingdom Soul Center

---

*"I am the vine; you are the branches."* - John 15:5
