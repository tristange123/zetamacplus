import { notFound } from 'next/navigation';
import NormalGame from '@/components/game/NormalGame';
import ExtraGame from '@/components/game/ExtraGame';
import { BOUNDS, EXTRA_GAME_MODES, MAIN_GAME_MODES, isExtraGameMode, isMainGameMode } from '@/lib/game/gameModeGlobals';
import { parseCustomGameSettings } from '@/lib/game/customGame';
import { type ProblemConfig } from '@/lib/game/generateProblem';

function firstParam(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] : value;
}

export default async function GamePage({
    params,
    searchParams,
}: {
    params: Promise<{ mode: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { mode } = await params;

    if (isMainGameMode(mode)) {
        const { timeFormat, problemType } = MAIN_GAME_MODES[mode];
        return (
            <NormalGame
                gameMode={mode}
                timeFormat={timeFormat}
                problems={{ kind: 'operations', operations: BOUNDS[problemType] }}
            />
        );
    }

    if (isExtraGameMode(mode)) {
        if (mode === 'custom') {
            const query = await searchParams;
            const { timeFormat, operations } = parseCustomGameSettings(firstParam(query.t), firstParam(query.ops));
            return <ExtraGame gameMode="custom" timeFormat={timeFormat} problems={{ kind: 'operations', operations }} />;
        }

        const problems: ProblemConfig = { kind: mode };
        return <ExtraGame gameMode={mode} timeFormat={EXTRA_GAME_MODES[mode].timeFormat} problems={problems} />;
    }

    notFound();
}
