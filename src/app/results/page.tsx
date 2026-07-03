"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useRouter } from 'next/navigation';
import {useGameContext} from '../gameContext'
import {useEffect } from 'react';
import {type GameContext} from '@/types/contextTypes'


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
    const timeFormat = gameContext?.timeFormat
    const problemList = gameContext?.problemSet
    const score = gameContext?.score
    const solveTimes: number[] = []
    
    useEffect (() => {
      async function postData(){
          const now = new Date();
          try{
              const testRes = await fetch('/api/test', {
                  method: 'POST',
                  headers: { "Content-Type": 'application/json'},
                  body: JSON.stringify({score, time: now, gameMode: gameContext.gameMode})
              });
              const testJson = await testRes.json();
              await fetch('/api/profile', {
                  method: 'PATCH',
                  headers: { "Content-Type": 'application/json'},
                  body: JSON.stringify({testId: testJson.testId, score, gameMode: gameContext.gameMode, testsAttempted: gameContext.testsAttempted})
              });
              await fetch('/api/problem', {
                  method: 'POST',
                  headers: { "Content-Type": 'application/json'},
                  body: JSON.stringify({testId: testJson.testId, gameMode: gameContext.gameMode, problemSet: gameContext.problemSet})
              });
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

    return (
        <section className="flex min-h-[calc(100vh-9rem)] flex-col gap-20 py-6 md:gap-25 md:py-8">
            <div className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 p-5 shadow-sm md:p-8">
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
                    <button
                        onClick={() => {router.replace("/game");}}
                        className="rounded-md border border-gray-300 bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300"
                    >
                        Restart
                    </button>
                    <button
                        onClick={() => router.back()}
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
                                    <th className="px-4 py-3 text-center font-semibold text-gray-700 md:px-5">Problem</th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-700 md:px-5">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {problemList.map((problem, index) => (
                                    <tr
                                        key={problem.orderNumber ?? index}
                                        className="border-b border-gray-200 last:border-b-0"
                                    >
                                        <td className="px-4 py-3 text-center text-gray-800 md:px-5">
                                            {problem.statement}{problem.answer}
                                        </td>
                                        <td className="px-4 py-3 text-center tabular-nums text-gray-600 md:px-5">
                                            {formatSolveTime(problem.solveTime)}
                                        </td>
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