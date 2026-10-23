"use client"

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameContext } from '@/app/gameContext'
import { authClient } from '@/lib/auth/auth-client'
import { createProblemSource, type ProblemConfig } from '@/lib/game/generateProblem'
import { type ScoreRank } from '@/types/contextTypes'
import { type RankedGameModeName } from '@/types/frontendTypes'
import GameBoard from './GameBoard'
import GameResults from './GameResults'
import { useTimedGame, type GameResult } from './useTimedGame'

type NormalGameProps = {
    gameMode: RankedGameModeName,
    timeFormat: number,
    problems: ProblemConfig,
}

// Ranked game: results are saved to the database and count towards stats
export default function NormalGame({gameMode, timeFormat, problems}: NormalGameProps) {
    const router = useRouter();
    const {updateTopScores} = useGameContext();
    const {data: session} = authClient.useSession();
    const isDaily = gameMode === "daily";

    const [scoreRank, setScoreRank] = useState<ScoreRank>(null);
    const [dailyStreak, setDailyStreak] = useState<number | null>(null);
    // Attempts not yet reported to the profile, including restarts
    const testsAttempted = useRef(1);
    const savedResult = useRef<GameResult | null>(null);

    const nextProblem = useMemo(() => createProblemSource(problems), [problems]);
    const game = useTimedGame({
        timeFormat,
        nextProblem,
        onFinish: (result) => setScoreRank(updateTopScores(gameMode, result.score)),
    });
    const {result} = game;

    async function updateTestsAttempted () {
        try{
            await fetch('/api/profile', {
                method: 'PATCH',
                headers: { "Content-Type": 'application/json'},
                body: JSON.stringify({testsAttempted: testsAttempted.current})
            });
            testsAttempted.current = 0;
        }
        catch (err){
            console.log(err);
        }
    }

    useEffect(() => {
        if (
            !result
            || !session
            || !session.user.emailVerified
            || savedResult.current === result
        ) {
            return;
        }

        savedResult.current = result;
        const attempts = testsAttempted.current;

        async function postData(result: GameResult) {
            const now = new Date();
            try {
                const testResultRes = await fetch('/api/test', {
                    method: 'POST',
                    headers: { "Content-Type": 'application/json'},
                    body: JSON.stringify({time: now, gameMode, score: result.score})
                });

                const testResult = await testResultRes.json();

                const profileResponse = await fetch('/api/profile', {
                    method: 'PATCH',
                    headers: { "Content-Type": 'application/json'},
                    body: JSON.stringify({testId: testResult.id, score: result.score, gameMode, testsAttempted: attempts})
                });

                if (!profileResponse.ok) {
                    throw new Error("Could not update profile");
                }
                testsAttempted.current -= attempts;

                if (gameMode === "daily") {
                    const statusResponse = await fetch('/api/daily/status', {cache: 'no-store'});
                    if (statusResponse.ok) {
                        const status = await statusResponse.json() as {currentStreak: number};
                        setDailyStreak(status.currentStreak);
                    }
                }

                await fetch('/api/problem', {
                    method: 'POST',
                    headers: { "Content-Type": 'application/json'},
                    body: JSON.stringify({testId: testResult.id, gameMode, problemSet: result.problems})
                });
            }
            catch (err){
                savedResult.current = null;
                console.log(err);
            }
        }
        void postData(result);
    }, [result, session, gameMode]);

    function restart() {
        testsAttempted.current += 1;
        setScoreRank(null);
        setDailyStreak(null);
        game.restart();
    }

    if (result) {
        return (
            <GameResults
                gameMode={gameMode}
                result={result}
                scoreRank={scoreRank}
                dailyStreak={dailyStreak}
                onRestart={isDaily ? undefined : restart}
            />
        );
    }

    return (
        <GameBoard
            game={game}
            onRestart={isDaily ? undefined : restart}
            onBack={isDaily ? undefined : () => {
                updateTestsAttempted();
                router.back();
            }}
        />
    );
}
