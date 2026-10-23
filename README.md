# Zetamac+

A modern take on [Zetamac](https://arithmetic.zetamac.com), the classic mental arithmetic trainer.

**Play it at [zetamacplus.com](https://zetamacplus.com).**

## About

Zetamac+ keeps what made the original great: fast, timed arithmetic drills with nothing in the way. It builds on that with accounts, detailed statistics, a daily challenge, global leaderboards, and live head-to-head matches. It is designed for anyone sharpening their mental math, whether for trading interviews, competitions, or the satisfaction of getting faster.

## Game modes

| Mode | Duration | Problems |
| --- | --- | --- |
| **Standard** | 2 min | Add/subtract 2–100; multiply/divide up to 100 by 2–12 |
| **Rapid** | 1 min | Add/subtract 2–50; multiply/divide up to 50 by 2–5 |
| **Sprint** | 10 sec | All operations with numbers from 2–10 |
| **Hard** | 3 min | Add/subtract 200–1,000; multiply/divide up to 100 by 6–20 |

Beyond the main four:

- **Daily challenge.** One shared problem set each day, one attempt per player, with a streak for consecutive days played.
- **Custom.** Choose the operations and number ranges yourself.
- **Versus.** Race another player live in a 1v1 match.
- **Other modes.** GCD, LCM, and a piano pitch-recognition test.

## Features

- **Detailed stats.** Every run is saved with per-problem solve times. The stats page shows your top runs per mode, averages, daily streaks, and a sortable, filterable history of past runs.
- **Leaderboards.** Global top 100 for every mode, ranked by high score or total problems solved.
- **Accounts.** Email or Google sign-in, with email verification.
- **Settings.** Toggle the on-screen score, timer, and keyboard to suit how you play.

## Tech stack

- **Framework:** Next.js 16 (App Router) with React 19 and TypeScript
- **Styling:** Tailwind CSS 4
- **Database:** PostgreSQL via Prisma
- **Auth:** Better Auth
- **Real-time:** Socket.IO, served from a custom Node server (`server.ts`)
- **Email:** Resend
- **Testing:** Playwright for end-to-end tests, Node's test runner for unit tests
- **Deployment:** Docker

## Getting started

### Prerequisites

- Node.js 22 or later
- A PostgreSQL database

### Setup

```bash
git clone https://github.com/tristange123/zetamacplus.git
cd zetamacplus
npm install
```

Create a `.env` file in the project root:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/zetamacplus
BETTER_AUTH_URL=http://localhost:3000

# Optional: Google sign-in
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Optional: verification and contact emails
RESEND_API_KEY=
RESEND_FROM=
```

Apply the database migrations, then start the dev server:

```bash
npx prisma migrate dev
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

### Running with Docker

```bash
docker build -t zetamacplus .
docker run --env-file .env.production -p 3000:3000 zetamacplus
```

## Testing

```bash
npm run test:versus        # Versus backend unit tests
npm run test:streak        # Daily streak unit tests
npx playwright test        # End-to-end tests
```

The Playwright suite builds and starts the app with `APP_ENV=test`, which loads `.env.test`. Point that file at a separate database, since the tests write to it.

## Contributing

Contributions are welcome, whether a bug fix, a new game mode, or a small polish.

1. **Open an issue first** for anything beyond a small fix, so we can agree on the approach before you invest time in it.
2. **Branch from `main`** and keep each pull request focused on a single change.
3. **Match the existing code.** Follow the conventions in the surrounding files, and run `npm run lint` before pushing.
4. **Test your change.** Run the relevant tests, and add new ones where it makes sense. For UI changes, include a screenshot in the pull request.
5. **Include a migration** if you change `prisma/schema.prisma` (`npx prisma migrate dev --name describe-your-change`).

Please note that this project uses Next.js 16, which differs from earlier versions in several ways. When in doubt, consult the bundled docs in `node_modules/next/dist/docs/`.

## Acknowledgements

Inspired by the original [Zetamac arithmetic game](https://arithmetic.zetamac.com).
