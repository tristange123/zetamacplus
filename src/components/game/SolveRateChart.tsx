"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

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

// Cumulative timestamps (seconds into the run) at which each problem was solved.
export function getCumulativeSolveTimes(problems: { solveTime: number | null }[]): number[] {
    const solveTimes: number[] = [];
    let curr = 0;
    for (const problem of problems) {
        if (problem.solveTime) {
            curr += problem.solveTime;
            solveTimes.push(curr);
        }
    }
    return solveTimes;
}

type SolveRateChartProps = {
    problems: { solveTime: number | null }[],
    timeFormat: number,
    compact?: boolean,
}

export default function SolveRateChart({ problems, timeFormat, compact = false }: SolveRateChartProps) {
    const solveTimes = getCumulativeSolveTimes(problems);
    // Stored runs may not know their exact length (e.g. custom), so never cut off the last solve.
    const totalTime = Math.max(timeFormat, Math.ceil(solveTimes.at(-1) ?? 0));

    const rawSolveRates = PPM(solveTimes, totalTime);
    const solveRatesAlpha02 = exponentialSmoothing(rawSolveRates, 0.2);
    const solveRatesAlpha07 = exponentialSmoothing(rawSolveRates, 1);
    const solveRates = solveRatesAlpha02.map((point, index) => ({
        time: point.time,
        alpha02: point.score,
        alpha07: solveRatesAlpha07[index].score,
    }));
    const timeTicks = getTimeTicks(totalTime);
    const tickStyle = { fill: '#4b5563', fontSize: compact ? 10 : 12 };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={solveRates} margin={compact ? { top: 8, right: 8, left: -24, bottom: 0 } : undefined}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                    dataKey="time"
                    type="number"
                    domain={[0, totalTime]}
                    ticks={timeTicks}
                    tickFormatter={(time) => `${time}`}
                    tick={tickStyle}
                />
                <YAxis tick={tickStyle} />
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
                        fontSize: compact ? 12 : undefined,
                    }}
                />
                <Line type="monotone" dataKey="alpha07" stroke="#d1d5db" strokeWidth={compact ? 2 : 3} dot={false} isAnimationActive={!compact} />
                <Line type="monotone" dataKey="alpha02" stroke="#374151" strokeWidth={compact ? 2 : 3} dot={false} isAnimationActive={!compact} />
            </LineChart>
        </ResponsiveContainer>
    );
}
