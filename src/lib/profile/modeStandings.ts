import prisma from '@/lib/db/prisma'
import { Prisma } from '@/generated/prisma/client'
import { MAIN_GAME_MODES } from '@/lib/game/gameModeGlobals'
import { type MainGameModeName } from '@/types/frontendTypes'

export type ModeStanding = {
    score: number | null,
    // 1-based place among everyone with a best score in this mode; null when the user has none
    rank: number | null,
    total: number,
}

export type ModeStandings = Record<MainGameModeName, ModeStanding>

type StandingRow = { score: number | null, total: bigint, above: bigint }

// Each player's best run is the test referenced by their `<mode>_1` column, matching the leaderboard.
async function getModeStanding(userId: string, mode: MainGameModeName): Promise<ModeStanding> {
    // mode comes from the fixed MAIN_GAME_MODES keys, so it is safe as an identifier
    const bestColumn = Prisma.raw(`"${mode}_1"`);
    const rows = await prisma.$queryRaw<StandingRow[]>`
        WITH best AS (
            SELECT p."userId", t.score
            FROM "Profile" p
            JOIN "Test" t ON t.id = p.${bestColumn}
            WHERE t."gameMode" = ${mode}
        ),
        mine AS (
            SELECT score FROM best WHERE "userId" = ${userId}
        )
        SELECT
            (SELECT score FROM mine) AS score,
            (SELECT count(*) FROM best) AS total,
            (SELECT count(*) FROM best WHERE score > (SELECT score FROM mine)) AS above
    `;
    const row = rows[0];
    const score = row?.score ?? null;
    return {
        score,
        rank: score == null ? null : Number(row.above) + 1,
        total: Number(row?.total ?? 0),
    };
}

export async function getModeStandings(userId: string): Promise<ModeStandings> {
    const modes = Object.keys(MAIN_GAME_MODES) as MainGameModeName[];
    const standings = await Promise.all(modes.map((mode) => getModeStanding(userId, mode)));
    return Object.fromEntries(modes.map((mode, index) => [mode, standings[index]])) as ModeStandings;
}
