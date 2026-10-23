"use client"

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createProblemSource, type ProblemConfig } from '@/lib/game/generateProblem'
import { type ExtraGameModeName } from '@/types/frontendTypes'
import GameBoard from './GameBoard'
import GameResults from './GameResults'
import { useTimedGame } from './useTimedGame'

type ExtraGameProps = {
    gameMode: ExtraGameModeName,
    timeFormat: number,
    problems: ProblemConfig,
}

// Unranked game: nothing is saved
export default function ExtraGame({gameMode, timeFormat, problems}: ExtraGameProps) {
    const router = useRouter();
    const nextProblem = useMemo(() => createProblemSource(problems), [problems]);
    const game = useTimedGame({timeFormat, nextProblem});

    if (game.result) {
        return <GameResults gameMode={gameMode} result={game.result} onRestart={game.restart} />;
    }

    return <GameBoard game={game} onRestart={game.restart} onBack={() => router.back()} />;
}
