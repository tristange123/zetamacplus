'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useGameContext } from '../gameContext';
import { type Operation } from '@/types/frontendTypes';

type NumberBounds = {
    min: number;
    max: number;
};

type EditableNumberBounds = {
    min: number | '';
    max: number | '';
};

type OperationNumberBounds = {
    first: EditableNumberBounds;
    second: EditableNumberBounds;
};

const OPERATIONS: {
    op: Operation;
    label: string;
    maxAllowed: number;
}[] = [
    { op: '+', label: 'Addition', maxAllowed: 1000 },
    { op: '-', label: 'Subtraction', maxAllowed: 1000 },
    { op: '*', label: 'Multiplication', maxAllowed: 100 },
    { op: '/', label: 'Division', maxAllowed: 100 },
];

const DEFAULT_OPERATION_BOUNDS: Record<Operation, OperationNumberBounds> = {
    '+': {
        first: { min: 2, max: 100 },
        second: { min: 2, max: 100 },
    },
    '-': {
        first: { min: 2, max: 100 },
        second: { min: 2, max: 100 },
    },
    '*': {
        first: { min: 2, max: 100 },
        second: { min: 2, max: 12 },
    },
    '/': {
        first: { min: 2, max: 100 },
        second: { min: 2, max: 12 },
    },
};

function buildOperations(
    bounds: Record<Operation, OperationNumberBounds>,
    enabledOperations: Record<Operation, boolean>
) {
    const selectedOperations: Partial<Record<Operation, Record<string, number[]>>> = {};

    for (const { op } of OPERATIONS) {
        if (enabledOperations[op]) {
            const { first, second } = bounds[op];
            selectedOperations[op] = {
                first: [first.min as number, first.max as number],
                second: [second.min as number, second.max as number],
            };
        }
    }

    return selectedOperations;
}

function getDefaultBounds(gameContext: ReturnType<typeof useGameContext>): Record<Operation, OperationNumberBounds> {
    return {
        '+': {
            first: {
                min: gameContext?.operations['+']?.first[0] ?? DEFAULT_OPERATION_BOUNDS['+'].first.min,
                max: gameContext?.operations['+']?.first[1] ?? DEFAULT_OPERATION_BOUNDS['+'].first.max,
            },
            second: {
                min: gameContext?.operations['+']?.second[0] ?? DEFAULT_OPERATION_BOUNDS['+'].second.min,
                max: gameContext?.operations['+']?.second[1] ?? DEFAULT_OPERATION_BOUNDS['+'].second.max,
            },
        },
        '-': {
            first: {
                min: gameContext?.operations['-']?.first[0] ?? DEFAULT_OPERATION_BOUNDS['-'].first.min,
                max: gameContext?.operations['-']?.first[1] ?? DEFAULT_OPERATION_BOUNDS['-'].first.max,
            },
            second: {
                min: gameContext?.operations['-']?.second[0] ?? DEFAULT_OPERATION_BOUNDS['-'].second.min,
                max: gameContext?.operations['-']?.second[1] ?? DEFAULT_OPERATION_BOUNDS['-'].second.max,
            },
        },
        '*': {
            first: {
                min: gameContext?.operations['*']?.first[0] ?? DEFAULT_OPERATION_BOUNDS['*'].first.min,
                max: gameContext?.operations['*']?.first[1] ?? DEFAULT_OPERATION_BOUNDS['*'].first.max,
            },
            second: {
                min: gameContext?.operations['*']?.second[0] ?? DEFAULT_OPERATION_BOUNDS['*'].second.min,
                max: gameContext?.operations['*']?.second[1] ?? DEFAULT_OPERATION_BOUNDS['*'].second.max,
            },
        },
        '/': {
            first: {
                min: gameContext?.operations['/']?.first[0] ?? DEFAULT_OPERATION_BOUNDS['/'].first.min,
                max: gameContext?.operations['/']?.first[1] ?? DEFAULT_OPERATION_BOUNDS['/'].first.max,
            },
            second: {
                min: gameContext?.operations['/']?.second[0] ?? DEFAULT_OPERATION_BOUNDS['/'].second.min,
                max: gameContext?.operations['/']?.second[1] ?? DEFAULT_OPERATION_BOUNDS['/'].second.max,
            },
        },
    };
}

function getDefaultEnabledOperations(gameContext: ReturnType<typeof useGameContext>): Record<Operation, boolean> {
    const savedOperations = gameContext.operations;
    const hasSavedOperations = Object.keys(savedOperations).length > 0;

    return {
        '+': !hasSavedOperations || savedOperations['+'] !== undefined,
        '-': !hasSavedOperations || savedOperations['-'] !== undefined,
        '*': !hasSavedOperations || savedOperations['*'] !== undefined,
        '/': !hasSavedOperations || savedOperations['/'] !== undefined,
    };
}

function isNumberBoundsInvalid(bounds: EditableNumberBounds, maxAllowed: number) {
    const { min, max } = bounds;

    return min === '' || max === '' || min < 2 || max > maxAllowed || min > max;
}

function isBoundFieldInvalid(
    bounds: EditableNumberBounds,
    field: keyof EditableNumberBounds,
    maxAllowed: number
) {
    const { min, max } = bounds;

    if (field === 'min') {
        return min === '' || min < 2 || (max !== '' && min > max);
    }

    return max === '' || max > maxAllowed || (min !== '' && min > max);
}

export default function Custom() {
    const router = useRouter();
    const gameContext = useGameContext();

    const [timeFormat, setTimeFormat] = useState(gameContext?.timeFormat ?? 120);
    const [operationBounds, setOperationBounds] = useState<Record<Operation, OperationNumberBounds>>(() =>
        getDefaultBounds(gameContext)
    );
    const [enabledOperations, setEnabledOperations] = useState<Record<Operation, boolean>>(() =>
        getDefaultEnabledOperations(gameContext)
    );
    const [error, setError] = useState('');

    function updateOperationBound(
        op: Operation,
        number: 'first' | 'second',
        field: keyof NumberBounds,
        value: string
    ) {
        if (value === '') {
            setOperationBounds((prev) => ({
                ...prev,
                [op]: {
                    ...prev[op],
                    [number]: {
                        ...prev[op][number],
                        [field]: '',
                    },
                },
            }));
            setError('');
            return;
        }

        const parsed = Number(value);
        if (Number.isNaN(parsed)) {
            return;
        }

        setOperationBounds((prev) => ({
            ...prev,
            [op]: {
                ...prev[op],
                [number]: {
                    ...prev[op][number],
                    [field]: parsed,
                },
            },
        }));
        setError('');
    }

    function toggleOperation(op: Operation) {
        setEnabledOperations((prev) => ({
            ...prev,
            [op]: !prev[op],
        }));
        setError('');
    }

    function validateBounds(): string | null {
        if (!OPERATIONS.some(({ op }) => enabledOperations[op])) {
            return 'Choose at least one operation.';
        }

        for (const { op, label, maxAllowed } of OPERATIONS) {
            if (!enabledOperations[op]) {
                continue;
            }

            const { first, second } = operationBounds[op];

            if (isNumberBoundsInvalid(first, maxAllowed)) {
                if (first.min === '' || first.max === '') {
                    return `${label} first number min and max are required.`;
                }
                if (first.min < 2) {
                    return `${label} first number minimum must be at least 2.`;
                }
                if (first.max > maxAllowed) {
                    return `${label} first number maximum cannot exceed ${maxAllowed}.`;
                }
                if (first.min > first.max) {
                    return `${label} first number minimum cannot be greater than maximum.`;
                }
            }

            if (isNumberBoundsInvalid(second, maxAllowed)) {
                if (second.min === '' || second.max === '') {
                    return `${label} second number min and max are required.`;
                }
                if (second.min < 2) {
                    return `${label} second number minimum must be at least 2.`;
                }
                if (second.max > maxAllowed) {
                    return `${label} second number maximum cannot exceed ${maxAllowed}.`;
                }
                if (second.min > second.max) {
                    return `${label} second number minimum cannot be greater than maximum.`;
                }
            }
        }

        return null;
    }

    function isOperationInvalid(op: Operation, maxAllowed: number) {
        if (!enabledOperations[op]) {
            return false;
        }

        const { first, second } = operationBounds[op];

        return isNumberBoundsInvalid(first, maxAllowed) || isNumberBoundsInvalid(second, maxAllowed);
    }

    function startCustomGame() {
        const validationError = validateBounds();
        if (validationError) {
            setError(validationError);
            return;
        }

        gameContext?.setGameMode('custom');
        localStorage.setItem("gameMode", "custom");
        gameContext?.setTimeFormat(timeFormat);
        localStorage.setItem("timeFormat", String(timeFormat));
        gameContext?.setOperations(buildOperations(operationBounds, enabledOperations));
        localStorage.setItem("operations", JSON.stringify(buildOperations(operationBounds, enabledOperations)));

        localStorage.setItem("testLogged", "false");
        
        router.push('/game');
    }

    const inputClassName =
        'w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none transition [appearance:textfield] focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-200 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';
    const invalidInputClassName =
        'w-full appearance-none rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-gray-800 outline-none transition [appearance:textfield] focus:border-red-300 focus:bg-red-50 focus:ring-2 focus:ring-red-100 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';

    return (
        <section className="flex min-h-[calc(100vh-9rem)] flex-col items-center justify-center">
            <div className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 p-5 shadow-sm md:p-8">
                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-semibold tracking-tight text-gray-800 md:text-3xl">
                        Custom Options
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">Set your own bounds and time limit</p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {OPERATIONS.map(({ op, label, maxAllowed }) => {
                        const isEnabled = enabledOperations[op];
                        const isInvalid = isOperationInvalid(op, maxAllowed);
                        const { first, second } = operationBounds[op];

                        return (
                            <div
                                key={op}
                                className={`rounded-xl border p-4 shadow-sm transition hover:shadow ${
                                    isInvalid
                                        ? 'border-red-200 bg-red-100/70 hover:border-red-300'
                                        : isEnabled
                                            ? 'border-gray-300 bg-white ring-2 ring-gray-100 hover:border-gray-400'
                                            : 'border-gray-200 bg-gray-100/80 opacity-70 hover:border-gray-300'
                                }`}
                            >
                                <div className="mb-4 flex items-start justify-between gap-3">
                                    <div>
                                        <p className={`text-base font-semibold ${isEnabled ? 'text-gray-800' : 'text-gray-500'}`}>
                                            {label}
                                        </p>
                                        <p className="text-xs text-gray-500">Range: 2 – {maxAllowed}</p>
                                    </div>
                                    <label className="flex cursor-pointer items-center pt-0.5">
                                        <input
                                            type="checkbox"
                                            checked={isEnabled}
                                            onChange={() => toggleOperation(op)}
                                            className="h-5 w-5 cursor-pointer rounded border-gray-300 accent-gray-800"
                                            style={{ accentColor: '#1f2937' }}
                                        />
                                    </label>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            First Number
                                        </p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                                    Min
                                                </label>
                                                <input
                                                    type="number"
                                                    min={2}
                                                    max={maxAllowed}
                                                    value={first.min}
                                                    onChange={(e) => updateOperationBound(op, 'first', 'min', e.target.value)}
                                                    className={
                                                        isEnabled && isBoundFieldInvalid(first, 'min', maxAllowed)
                                                            ? invalidInputClassName
                                                            : inputClassName
                                                    }
                                                    disabled={!isEnabled}
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                                    Max
                                                </label>
                                                <input
                                                    type="number"
                                                    min={2}
                                                    max={maxAllowed}
                                                    value={first.max}
                                                    onChange={(e) => updateOperationBound(op, 'first', 'max', e.target.value)}
                                                    className={
                                                        isEnabled && isBoundFieldInvalid(first, 'max', maxAllowed)
                                                            ? invalidInputClassName
                                                            : inputClassName
                                                    }
                                                    disabled={!isEnabled}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Second Number
                                        </p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                                    Min
                                                </label>
                                                <input
                                                    type="number"
                                                    min={2}
                                                    max={maxAllowed}
                                                    value={second.min}
                                                    onChange={(e) => updateOperationBound(op, 'second', 'min', e.target.value)}
                                                    className={
                                                        isEnabled && isBoundFieldInvalid(second, 'min', maxAllowed)
                                                            ? invalidInputClassName
                                                            : inputClassName
                                                    }
                                                    disabled={!isEnabled}
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                                    Max
                                                </label>
                                                <input
                                                    type="number"
                                                    min={2}
                                                    max={maxAllowed}
                                                    value={second.max}
                                                    onChange={(e) => updateOperationBound(op, 'second', 'max', e.target.value)}
                                                    className={
                                                        isEnabled && isBoundFieldInvalid(second, 'max', maxAllowed)
                                                            ? invalidInputClassName
                                                            : inputClassName
                                                    }
                                                    disabled={!isEnabled}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <p className="text-base font-semibold text-gray-800">Time Limit</p>
                        </div>
                        <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-700">
                            {timeFormat}s
                        </span>
                    </div>
                    <input
                        type="range"
                        min={10}
                        max={300}
                        value={timeFormat}
                        onChange={(e) => setTimeFormat(Number(e.target.value))}
                        className="w-full cursor-pointer accent-gray-800"
                        style={{ accentColor: '#1f2937' }}
                    />
                    <div className="mt-2 flex justify-between text-sm font-medium text-gray-500">
                        <span>10s</span>
                        <span>300s</span>
                    </div>
                </div>

                {error && (
                    <p className="mt-4 text-center text-sm text-red-600">{error}</p>
                )}

                <div className="mt-6 flex justify-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="rounded-lg border border-gray-200 bg-white px-6 py-3 text-base font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-100"
                    >
                        Back
                    </button>
                    <button
                        onClick={startCustomGame}
                        className="rounded-lg bg-gray-800 px-8 py-3 text-base font-semibold text-gray-100 transition hover:bg-gray-900"
                    >
                        Start
                    </button>
                </div>
            </div>
        </section>
    );
}
