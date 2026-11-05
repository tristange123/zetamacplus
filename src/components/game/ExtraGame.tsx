"use client"

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createProblemSource, type ProblemConfig } from '@/lib/game/generateProblem'
import { type TrainingCoefficient } from '@/lib/training/bayes'
import { type ExtraGameModeName } from '@/types/frontendTypes'
import GameBoard from './GameBoard'
import GameResults from './GameResults'
import { useTimedGame } from './useTimedGame'

type ExtraGameProps = {
    gameMode: ExtraGameModeName,
    timeFormat: number,
    problems: ProblemConfig,
    trainingCoefficients?: TrainingCoefficient[],
}

// Unranked game: nothing is saved
export default function ExtraGame({gameMode, timeFormat, problems, trainingCoefficients}: ExtraGameProps) {
    const router = useRouter();
    const nextProblem = useMemo(() => createProblemSource(problems), [problems]);
    const game = useTimedGame({timeFormat, nextProblem});

    if (game.result) {
        return (
            <GameResults
                gameMode={gameMode}
                result={game.result}
                onRestart={game.restart}
                trainingCoefficients={trainingCoefficients}
            />
        );
    }

    return <GameBoard game={game} onRestart={game.restart} onBack={() => router.back()} />;
}
