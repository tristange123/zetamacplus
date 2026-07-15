"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useRouter } from 'next/navigation';
import {useGameContext} from '../(layout)/gameContext'
import {useState, useEffect } from 'react';
import {type GameContext} from '@/types/contextTypes'
import { type GameModeName, type Problem } from '@/types/frontendTypes'
import {authClient} from '@/lib/auth/auth-client'
import { Calculator, Rabbit, SportShoe, Skull, NotebookText, Clock, type LucideIcon } from 'lucide-react'

const GAME_MODE_ICONS: Record<GameModeName, LucideIcon> = {
    standard: Calculator,
    rapid: Rabbit,
    sprint: SportShoe,
    hard: Skull,
    custom: NotebookText,
    daily: Clock,
};

function isGameModeName(gameMode: string | null): gameMode is GameModeName {
    return gameMode === "standard"
        || gameMode === "rapid"
        || gameMode === "sprint"
        || gameMode === "hard"
        || gameMode === "custom"
        || gameMode === "daily";
}



function formatSolveTime(seconds: number | null): string {
    if (seconds == null) return '—';
    return `${seconds.toFixed(1)}s`;
}

// moving average points per 2 minutes
function PPM(solveTimes: number[], totalTime: number) {
    const res = [{ time: 0, score: 0 }];

    for (let i = 1; i <= totalTime; i++) {
        let rate;
        if (i < 3) {
            rate = solveTimes.filter((x) => {
                return x > 0 && x < i + 3;
            }).length / (i + 3);
        } else if (i > totalTime - 3) {
            rate = solveTimes.filter((x) => {
                return x < totalTime && x > i - 3;
            }).length / (totalTime - i + 3);
        } else {
            rate = solveTimes.filter((x) => {
                return x < i + 3 && x > i - 3;
            }).length / 6;
        }
        res.push({ time: i, score: totalTime * rate });
    }
    return res;
}

function getTimeTicks(totalTime: number) {
    const tickCount = 4;
    return Array.from({ length: tickCount + 1 }, (_, index) => Number(((totalTime / tickCount) * index).toFixed(2)));
}

function exponentialSmoothing(data: Record<string, number>[], alpha = 0.5) {
    if (!data || data.length === 0) return [];

    const smoothed = [{ time: data[0].time, score: data[0].score }];

    for (let i = 1; i < data.length; i++) {
        const smoothedScore = alpha * data[i].score + (1 - alpha) * smoothed[i - 1].score;
        smoothed.push({ time: data[i].time, score: Number(smoothedScore.toFixed(2)) });
    }

    return smoothed;
}

export default function ClientSide() {
    const router = useRouter();
    const gameContext: GameContext = useGameContext();
    const [timeFormat, setTimeFormat] = useState(gameContext.timeFormat);
    const [problemList, setProblemList] = useState<Problem[]>(gameContext.problemSet)
    const [score, setScore] = useState(gameContext.score);
    const [gameMode, setGameMode] = useState<GameModeName>(gameContext.gameMode);
    const [isDailyGame, setIsDailyGame] = useState(gameContext.gameMode === "daily");
    const {data: session} = authClient.useSession()
    const solveTimes: number[] = []


    
    
    useEffect (() => {
      setTimeFormat(Number(localStorage.getItem("timeFormat") ?? "120"))
      setProblemList(JSON.parse(localStorage.getItem("problemSet") ?? "[]"));
      setScore(Number(localStorage.getItem("score") ?? "0"));
      const storedGameMode = localStorage.getItem("gameMode");
      if (isGameModeName(storedGameMode)) {
        setGameMode(storedGameMode);
      }
      setIsDailyGame(storedGameMode === "daily");
      async function postData(){
        
          const now = new Date();
          try{
              if (session && session.user.emailVerified && localStorage.getItem("testLogged") == "false"){

                const testResultRes = await fetch('/api/test', {
                    method: 'POST',
                    headers: { "Content-Type": 'application/json'},
                    body: JSON.stringify({time: now, gameMode: gameContext.gameMode, score: gameContext.score})
                });

                const testResult = await testResultRes.json();

                await fetch('/api/profile', {
                    method: 'PATCH',
                    headers: { "Content-Type": 'application/json'},
                    body: JSON.stringify({testId: testResult.id, score, gameMode: gameContext.gameMode, testsAttempted: gameContext.testsAttempted})
                });
                await fetch('/api/problem', {
                    method: 'POST',
                    headers: { "Content-Type": 'application/json'},
                    body: JSON.stringify({testId: testResult.id, gameMode: gameContext.gameMode, problemSet: gameContext.problemSet})
                     
                });
                localStorage.setItem("testLogged", "true");

              }
              else{
                console.log("test already logged")
              }
               
              
          } 
          catch (err){
              console.log(err);
          }
      
        }
        postData();
    }, [])
    let curr = 0
    for (const problem of problemList){
        if(problem.solveTime){
            curr += problem.solveTime;
            solveTimes.push(curr);
        }
    }

    if (timeFormat == null){
        return <div>Error</div>
    }
   

    const solveRates = exponentialSmoothing(PPM(solveTimes, timeFormat));
    const timeTicks = getTimeTicks(timeFormat);
    const ScoreGameModeIcon = GAME_MODE_ICONS[gameMode];

    let cumulativeTime = 0;
    const problemRows = problemList.map((problem, index) => {
        if (problem.solveTime != null) {
            cumulativeTime += problem.solveTime;
        }
        return {
            key: problem.orderNumber ?? index,
            number: (problem.orderNumber ?? index) + 1,
            statement: `${problem.statement}${problem.answer}`,
            cumulativeTime,
            solveTime: problem.solveTime,
        };
    });

    return (
        <section className="flex min-h-[calc(100vh-9rem)] flex-col gap-20 py-6 md:gap-25 md:py-8">
            <div className="relative w-full rounded-2xl border border-gray-200 bg-gray-50/70 p-5 shadow-sm md:p-8">
                {/* <ScoreGameModeIcon
                    size={32}
                    className="absolute left-5 top-5 text-gray-500 md:left-8 md:top-8"
                    aria-hidden="true"
                /> */}
                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-semibold tracking-tight text-gray-800 md:text-3xl">Score: {score}</h2>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-3 md:p-5">
                    <div className="h-64 w-full md:h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={solveRates}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="time"
                                    type="number"
                                    domain={[0, timeFormat]}
                                    ticks={timeTicks}
                                    tickFormatter={(time) => `${time}`}
                                    tick={{ fill: '#4b5563', fontSize: 12 }}
                                />
                                <YAxis tick={{ fill: '#4b5563', fontSize: 12 }} />
                                {solveTimes.map((solveTime, index) => (
                                    <ReferenceLine
                                        key={`${solveTime}-${index}`}
                                        x={solveTime}
                                        stroke="rgba(0, 0, 0, 0.16)"
                                        strokeWidth={1}
                                    />
                                ))}
                                <Tooltip
                                    labelFormatter={(time) => `Time: ${time}`}
                                    formatter={(rate) => [rate, 'Rate']}
                                    contentStyle={{
                                        borderRadius: '0.5rem',
                                        border: '1px solid #d1d5db',
                                        color: '#1f2937',
                                    }}
                                />
                                <Line type="monotone" dataKey="score" stroke="#374151" strokeWidth={3} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="mt-6 flex justify-center gap-3">
                    {!isDailyGame && (<button
                        onClick={() => {
                            localStorage.setItem("testLogged", "false");
                            router.replace("/game");
                        }}
                        className="rounded-md border border-gray-300 bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300"
                    >
                        Restart
                    </button>
                    )}
                    <button
                        onClick={() => router.push('/')}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                    >
                        Back
                    </button>
                </div>
            </div>

            <div className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 p-5 shadow-sm md:p-8">
                <div className="rounded-xl border border-gray-200 bg-white">
                    {problemList.length === 0 ? (
                        <p className="px-4 py-6 text-center text-base text-gray-500 md:px-5 md:text-lg">No problems solved.</p>
                    ) : (
                        <table className="w-full text-base md:text-lg">
                            <thead>
                                <tr className="border-b border-gray-50 bg-gray-50/80">
                                    <th className="px-4 py-3 text-center font-semibold text-gray-700 md:px-5">#</th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-700 md:px-5">Problem</th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-700 md:px-5">Solve Time</th>
                                    {/* <th className="px-4 py-3 text-center font-semibold text-gray-700 md:px-5">Cum. Time</th> */}
                                </tr>
                            </thead>
                            <tbody>
                                {problemRows.map((row) => (
                                    <tr
                                        key={row.key}
                                        className="border-b border-gray-200 last:border-b-0"
                                    >
                                        <td className="px-4 py-3 text-center tabular-nums text-gray-600 md:px-5">
                                            {row.number}
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-800 md:px-5">
                                            {row.statement}
                                        </td>
                                        
                                        <td className="px-4 py-3 text-center tabular-nums text-gray-600 md:px-5">
                                            {formatSolveTime(row.solveTime)}
                                        </td>
                                        {/* <td className="px-4 py-3 text-center tabular-nums text-gray-600 md:px-5">
                                            {formatSolveTime(row.cumulativeTime)}
                                        </td> */}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </section>
    );
}