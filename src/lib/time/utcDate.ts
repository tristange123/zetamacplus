const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export function getUtcDateKey(date: Date): string {
    return date.toISOString().slice(0, 10);
}

export function getUtcDayStart(date: Date = new Date()): Date {
    return new Date(Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
    ));
}

export function addUtcDays(date: Date, days: number): Date {
    return new Date(getUtcDayStart(date).getTime() + days * MILLISECONDS_PER_DAY);
}
