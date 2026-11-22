'use client'

import {useMemo, useState, useSyncExternalStore} from 'react';
import {type TestDb} from '@/types/dbTypes.js'
import {getTimeFormat} from '@/lib/game/gameModeGlobals'

const WEEKS = 53;
const CELL = 11;
const GAP = 3;
const LEVEL_CLASSES = ['bg-gray-100', 'bg-gray-300', 'bg-gray-400', 'bg-gray-600', 'bg-gray-800'];
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

function dayKey(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function levelFor(count: number, max: number): number {
    if (count === 0) return 0;
    return Math.min(4, Math.ceil((count / max) * 4));
}

// Seconds as "45s", "12m 30s" or "1h 5m".
function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
}

function formatDate(date: Date): string {
    return date.toLocaleDateString(undefined, {weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'});
}

// Dates depend on the viewer's local timezone, so the grid is only built on the client.
const subscribe = () => () => {};
function useIsClient() {
    return useSyncExternalStore(subscribe, () => true, () => false);
}

type Day = {
    key: string,
    date: Date,
    // Seconds played that day, in total and per game mode
    seconds: number,
    modes: [string, number][],
    inFuture: boolean,
};

function buildWeeks(tests: TestDb[]) {
    const byDay = new Map<string, Map<string, number>>();
    for (const test of tests) {
        // Runs don't store how long they lasted, so a finished run counts as its mode's full length.
        // Unfinished runs (an abandoned daily) have no known length and are skipped.
        const runSeconds = getTimeFormat(test.gameMode);
        if (!test.completed || runSeconds == null) continue;
        const key = dayKey(new Date(test.time));
        const modes = byDay.get(key) ?? new Map<string, number>();
        modes.set(test.gameMode, (modes.get(test.gameMode) ?? 0) + runSeconds);
        byDay.set(key, modes);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Start on the Sunday WEEKS-1 weeks before this week's Sunday.
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay() - (WEEKS - 1) * 7);

    const weeks: Day[][] = [];
    let total = 0;
    let max = 0;
    for (let w = 0; w < WEEKS; w++) {
        const week: Day[] = [];
        for (let d = 0; d < 7; d++) {
            const date = new Date(start);
            date.setDate(start.getDate() + w * 7 + d);
            const key = dayKey(date);
            const inFuture = date > today;
            const modeCounts = inFuture ? undefined : byDay.get(key);
            const modes = modeCounts
                ? [...modeCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
                : [];
            const seconds = modes.reduce((sum, [, n]) => sum + n, 0);
            total += seconds;
            max = Math.max(max, seconds);
            week.push({key, date, seconds, modes, inFuture});
        }
        weeks.push(week);
    }

    // Month label sits above the first week whose first day falls in a new month.
    const monthLabels = weeks.map((week, i) => {
        const month = week[0].date.getMonth();
        if (i === 0 || month !== weeks[i - 1][0].date.getMonth()) {
            return week[0].date.toLocaleDateString(undefined, {month: 'short'});
        }
        return '';
    });
    // Drop a leading label that would collide with the next one.
    if (monthLabels[0] && monthLabels.slice(1, 3).some(Boolean)) monthLabels[0] = '';

    return {weeks, monthLabels, total, max};
}

type Hovered = {day: Day, x: number, y: number};

type ActivityCalendarProps = {
    tests: TestDb[]
}

export default function ActivityCalendar({tests}: ActivityCalendarProps) {
    const isClient = useIsClient();
    const data = useMemo(() => isClient ? buildWeeks(tests) : null, [isClient, tests]);
    const [hovered, setHovered] = useState<Hovered | null>(null);

    function showDay(day: Day, target: HTMLElement) {
        const rect = target.getBoundingClientRect();
        setHovered({day, x: rect.left + rect.width / 2, y: rect.top});
    }

    return (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-4 md:p-5">
            <div className="mb-4 flex items-end justify-between gap-3 border-b border-gray-200 pb-3">
                <div>
                    <h2 className="text-lg font-semibold tracking-tight text-gray-900">Run Calendar</h2>
                    <p className="mt-0.5 text-xs text-gray-500">
                        {data ? `${formatDuration(data.total)} played in the last year` : ' '}
                    </p>
                </div>
            </div>

            <div className="overflow-x-auto" onScroll={() => setHovered(null)}>
                <div className="inline-flex flex-col" style={{minHeight: 7 * (CELL + GAP) + 16}}>
                    {data && (
                        <>
                            <div className="flex pl-8 text-[10px] text-gray-500" style={{gap: GAP, height: 14}}>
                                {data.monthLabels.map((label, i) => (
                                    <div key={i} className="overflow-visible whitespace-nowrap" style={{width: CELL}}>
                                        {label}
                                    </div>
                                ))}
                            </div>
                            <div className="flex" onMouseLeave={() => setHovered(null)}>
                                <div className="flex w-8 flex-col text-[10px] text-gray-500" style={{gap: GAP}}>
                                    {DAY_LABELS.map((label, i) => (
                                        <div key={i} className="leading-none" style={{height: CELL}}>{label}</div>
                                    ))}
                                </div>
                                <div className="flex" style={{gap: GAP}}>
                                    {data.weeks.map((week, w) => (
                                        <div key={w} className="flex flex-col" style={{gap: GAP}}>
                                            {week.map((day) => {
                                                if (day.inFuture) {
                                                    return <div key={day.key} style={{width: CELL, height: CELL}} />;
                                                }
                                                const isHovered = hovered?.day.key === day.key;
                                                return (
                                                    <div
                                                        key={day.key}
                                                        role="img"
                                                        aria-label={`${formatDuration(day.seconds)} played on ${formatDate(day.date)}`}
                                                        onMouseEnter={(e) => showDay(day, e.currentTarget)}
                                                        onClick={(e) => showDay(day, e.currentTarget)}
                                                        className={`rounded-sm ${LEVEL_CLASSES[levelFor(day.seconds, data.max)]} ${
                                                            isHovered ? 'ring-1 ring-gray-900 ring-offset-1' : ''
                                                        }`}
                                                        style={{width: CELL, height: CELL}}
                                                    />
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="mt-3 flex items-center justify-end gap-1 text-[10px] text-gray-500">
                <span className="mr-1">Less</span>
                {LEVEL_CLASSES.map((cls) => (
                    <div key={cls} className={`rounded-sm ${cls}`} style={{width: CELL, height: CELL}} />
                ))}
                <span className="ml-1">More</span>
            </div>

            {hovered && (
                <div
                    className="pointer-events-none fixed z-50 min-w-36 -translate-x-1/2 -translate-y-full rounded-md bg-gray-900 px-3 py-2 text-xs text-white shadow-lg"
                    style={{left: hovered.x, top: hovered.y - 6}}
                    role="tooltip"
                >
                    <p className="font-semibold">
                        {formatDuration(hovered.day.seconds)} played
                    </p>
                    <p className="text-gray-300">{formatDate(hovered.day.date)}</p>
                    {hovered.day.modes.length > 0 && (
                        <ul className="mt-1.5 space-y-0.5 border-t border-gray-700 pt-1.5">
                            {hovered.day.modes.map(([mode, n]) => (
                                <li key={mode} className="flex justify-between gap-4">
                                    <span className="capitalize text-gray-300">{mode}</span>
                                    <span className="tabular-nums">{formatDuration(n)}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
