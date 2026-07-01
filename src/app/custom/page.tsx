'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useGameContext } from '../gameContext';
import { type Operation } from '@/types/frontendTypes';

const OPERATION_MIN = 2;

const OPERATION_SLIDERS: {
    op: Operation;
    label: string;
    max: number;
}[] = [
    { op: '+', label: 'Addition', max: 1000 },
    { op: '-', label: 'Subtraction', max: 1000 },
    { op: '*', label: 'Multiplication', max: 100 },
    { op: '/', label: 'Division', max: 100 },
];

function buildOperations(maxes: Record<Operation, number>) {
    return {
        '+': { first: [OPERATION_MIN, maxes['+']], second: [OPERATION_MIN, maxes['+']] },
        '-': { first: [OPERATION_MIN, maxes['-']], second: [OPERATION_MIN, maxes['-']] },
        '*': { first: [OPERATION_MIN, maxes['*']], second: [OPERATION_MIN, maxes['*']] },
        '/': { first: [OPERATION_MIN, maxes['/']], second: [OPERATION_MIN, maxes['/']] },
    };
}

export default function Custom() {
    const router = useRouter();
    const gameContext = useGameContext();

    const [timeFormat, setTimeFormat] = useState(gameContext?.timeFormat ?? 120);
    const [operationMaxes, setOperationMaxes] = useState<Record<Operation, number>>(() => ({
        '+': gameContext?.operations['+'].first[1] ?? 100,
        '-': gameContext?.operations['-'].first[1] ?? 100,
        '*': gameContext?.operations['*'].first[1] ?? 12,
        '/': gameContext?.operations['/'].first[1] ?? 12,
    }));

    function updateOperationMax(op: Operation, value: number) {
        setOperationMaxes((prev) => ({
            ...prev,
            [op]: value,
        }));
    }

    function startCustomGame() {
        gameContext?.setGameMode('custom');
        gameContext?.setTimeFormat(timeFormat);
        gameContext?.setOperations(buildOperations(operationMaxes));
        router.push('/game');
    }

    return (
        <section className="flex min-h-[calc(100vh-9rem)] flex-col pt-2">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 pb-6 text-xs font-medium text-gray-500 md:text-sm">
                <p>Mode: Custom</p>
                <p>Time: {timeFormat}s</p>
            </div>

            <div className="flex flex-1 flex-col justify-center">
                <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 bg-gray-200 py-8">
                    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6">
                        <h1 className="text-center text-2xl font-semibold tracking-tight text-gray-800 md:text-3xl">
                            Custom Options
                        </h1>

                        <div className="mx-auto grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
                            {OPERATION_SLIDERS.map(({ op, label, max }) => (
                                <div
                                    key={op}
                                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                                >
                                    <div className="mb-3 flex items-center justify-between">
                                        <p className="text-sm font-medium text-gray-700">
                                            {label} ({op})
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {OPERATION_MIN} – {operationMaxes[op]}
                                        </p>
                                    </div>
                                    <input
                                        type="range"
                                        min={OPERATION_MIN}
                                        max={max}
                                        value={operationMaxes[op]}
                                        onChange={(e) => updateOperationMax(op, Number(e.target.value))}
                                        className="w-full accent-gray-700"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="mx-auto flex w-full max-w-md flex-col items-center gap-2">
                            <p className="text-sm font-medium text-gray-600">Time Format</p>
                            <input
                                type="range"
                                min={10}
                                max={300}
                                value={timeFormat}
                                onChange={(e) => setTimeFormat(Number(e.target.value))}
                                className="w-full accent-gray-700"
                            />
                            <p className="text-sm text-gray-600">{timeFormat} seconds</p>
                        </div>
                    </div>
                </div>

                <div className="mx-auto flex w-full max-w-6xl justify-center gap-3 px-6 pt-4">
                    <button
                        onClick={startCustomGame}
                        className="rounded-md border border-gray-300 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-100 transition hover:bg-gray-900"
                    >
                        Start
                    </button>
                    <button
                        onClick={() => router.back()}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                    >
                        Back
                    </button>
                </div>
            </div>
        </section>
    );
}
