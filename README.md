# Thinq - Personal Thinking Companion

A calm, minimal, premium mobile app where you have short voice or text conversations with an AI that asks smart follow-up questions about what's on your mind.

## Tech Stack

- **React Native with Expo** - Cross-platform iOS + Android
- **Supabase** - Database and authentication
- **Claude API** (claude-haiku-4-5-20251001) - AI conversation
- **Whisper API** - Voice transcription

## Project Structure

```
thinq/
├── src/
│   ├── app/                    # Expo Router screens
│   │   ├── _layout.tsx         # Root layout
│   │   ├── (tabs)/             # Tab navigation
│   │   │   ├── _layout.tsx     # Tab layout
│   │   │   ├── index.tsx       # Home - session duration picker
│   │   │   ├── history.tsx     # Past sessions list
│   │   │   └── search.tsx      # Search past sessions
│   │   └── session/
│   │       └── [id].tsx        # Active session screen
│   ├── components/
│   │   └── ui/                 # Reusable UI components
│   │       ├── Button.tsx
│   │       ├── TimePicker.tsx
│   │       └── Icons.tsx
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useSession.ts
│   │   └── useSessions.ts
│   ├── lib/
│   │   └── supabase.ts         # Supabase client
│   ├── services/
│   │   ├── claude.ts           # Claude API integration
│   │   ├── supabase.ts         # Database operations
│   │   └── whisper.ts          # Voice transcription
│   └── types/
│       └── index.ts            # TypeScript interfaces
├── supabase/
│   └── schema.sql              # Run in Supabase SQL editor
├── package.json
├── app.json
├── babel.config.js
├── tailwind.config.js
├── tsconfig.json
└── .env.example
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

Required keys:
- `EXPO_PUBLIC_SUPABASE_URL` - From your Supabase project
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - From your Supabase project
- `EXPO_PUBLIC_ANTHROPIC_API_KEY` - From Anthropic console
- `EXPO_PUBLIC_OPENAI_API_KEY` - From OpenAI (for Whisper)

### 3. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run [`supabase/schema.sql`](supabase/schema.sql)
3. This creates: `profiles`, `sessions`, `messages` tables with RLS policies

### 4. Run the App

```bash
npx expo start
```

For iOS:
```bash
npx expo run:ios
```

For Android:
```bash
npx expo run:android
```

## Supabase Tables

The schema creates:

| Table | Purpose |
|-------|---------|
| `profiles` | Extends auth.users, stores user profile data |
| `sessions` | Individual thinking sessions with duration |
| `messages` | Conversation messages (user + assistant) |

Key features:
- Row Level Security (RLS) - users can only access their own data
- Full-text search with PostgreSQL `tsvector`
- Auto profile creation on signup via trigger

## API Keys Needed

1. **Supabase**: Create project → Settings → API
2. **Anthropic**: Console → API Keys (for Claude)
3. **OpenAI**: Platform → API Keys (for Whisper transcription)