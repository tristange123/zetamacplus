"use client"

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProblemSource, type ProblemConfig } from '@/lib/game/generateProblem'
import { type TrainingCoefficient } from '@/lib/training/bayes'
import { type ExtraGameModeName } from '@/types/frontendTypes'
import GameBoard from './GameBoard'
import GameResults from './GameResults'
import { useTimedGame, type GameResult } from './useTimedGame'

type ExtraGameProps = {
    gameMode: ExtraGameModeName,
    timeFormat: number,
    problems: ProblemConfig,
    trainingCoefficients?: TrainingCoefficient[],
}

// Extra games are unranked; training runs are still saved to improve the model.
export default function ExtraGame({gameMode, timeFormat, problems, trainingCoefficients}: ExtraGameProps) {
    const router = useRouter();
    const savedTrainingResult = useRef<GameResult | null>(null);
    const [updatedTrainingCoefficients, setUpdatedTrainingCoefficients] = useState<TrainingCoefficient[]>();
    const nextProblem = useMemo(() => createProblemSource(problems), [problems]);
    const game = useTimedGame({timeFormat, nextProblem});
    const {result} = game;

    useEffect(() => {
        if (gameMode !== "training" || !result || savedTrainingResult.current === result) {
            return;
        }

        savedTrainingResult.current = result;

        async function saveTrainingResult(trainingResult: GameResult) {
            try {
                const response = await fetch('/api/training/complete', {
                    method: 'POST',
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        score: trainingResult.score,
                        problems: trainingResult.problems,
                    }),
                });

                if (!response.ok) {
                    throw new Error("Could not save training result");
                }

                const data = await response.json() as {coefficients: TrainingCoefficient[]};
                if (savedTrainingResult.current === trainingResult) {
                    setUpdatedTrainingCoefficients(data.coefficients);
                }
            } catch (error) {
                if (savedTrainingResult.current === trainingResult) {
                    savedTrainingResult.current = null;
                }
                console.error(error);
            }
        }

        void saveTrainingResult(result);
    }, [gameMode, result]);

    function restart() {
        savedTrainingResult.current = null;
        setUpdatedTrainingCoefficients(undefined);
        game.restart();
    }

    if (result) {
        return (
            <GameResults
                gameMode={gameMode}
                result={result}
                onRestart={restart}
                trainingCoefficients={trainingCoefficients}
                updatedTrainingCoefficients={updatedTrainingCoefficients}
            />
        );
    }

    return <GameBoard game={game} onRestart={restart} onBack={() => router.back()} />;
}
