import { type Operation, type OperationBounds } from "@/types/frontendTypes"
import { BOUNDS, EXTRA_GAME_MODES } from "./gameModeGlobals"

const MIN_TIME = 10;
const MAX_TIME = 300;
const MAX_ALLOWED: Record<Operation, number> = {'+': 1000, '-': 1000, '*': 100, '/': 100};

export type CustomGameSettings = {
    timeFormat: number,
    operations: OperationBounds,
}

export function customGameUrl({timeFormat, operations}: CustomGameSettings): string {
    const params = new URLSearchParams({t: String(timeFormat), ops: JSON.stringify(operations)});
    return `/game/custom?${params}`;
}

function isValidRange(range: unknown, maxAllowed: number): range is [number, number] {
    return Array.isArray(range)
        && range.length === 2
        && range.every(Number.isInteger)
        && range[0] >= 2
        && range[0] <= range[1]
        && range[1] <= maxAllowed;
}

function parseOperations(raw: string | undefined): OperationBounds | null {
    if (!raw) return null;
    try {
        const parsed: unknown = JSON.parse(raw);
        if (typeof parsed !== "object" || parsed === null) return null;

        const operations: OperationBounds = {};
        for (const [op, bounds] of Object.entries(parsed)) {
            if (!Object.hasOwn(MAX_ALLOWED, op)) return null;
            const maxAllowed = MAX_ALLOWED[op as Operation];
            if (!isValidRange(bounds?.first, maxAllowed) || !isValidRange(bounds?.second, maxAllowed)) return null;
            operations[op as Operation] = {first: bounds.first, second: bounds.second};
        }
        return Object.keys(operations).length > 0 ? operations : null;
    }
    catch {
        return null;
    }
}

// Falls back to the standard settings when the URL is missing or invalid
export function parseCustomGameSettings(t: string | undefined, ops: string | undefined): CustomGameSettings {
    const time = Number(t);
    return {
        timeFormat: Number.isInteger(time) && time >= MIN_TIME && time <= MAX_TIME ? time : EXTRA_GAME_MODES.custom.timeFormat,
        operations: parseOperations(ops) ?? BOUNDS.medium,
    };
}
