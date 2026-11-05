import Link from 'next/link';
import requireSession from '@/lib/auth/requireSession';
import fetchTrainingProblems from '@/lib/training/fetchTrainingProblems';
import ExtraGame from '@/components/game/ExtraGame';
import {EXTRA_GAME_MODES} from '@/lib/game/gameModeGlobals';

export const dynamic = 'force-dynamic';

function BackButton() {
    return (
        <Link
            href="/"
            className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
        >
            Back
        </Link>
    );
}

export default async function TrainingPage() {
    const session = await requireSession().catch(() => null);

    if (!session) {
        return (
            <section className="flex min-h-[calc(100vh-9rem)] items-center justify-center">
                <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-8 text-center shadow-sm">
                    <h1 className="text-2xl font-semibold tracking-tight text-gray-800">Training</h1>
                    <p className="mt-2 text-sm text-gray-600">Log in and verify your email to play the training mode.</p>
                    <div className="mt-5">
                        <BackButton />
                    </div>
                </div>
            </section>
        );
    }

    // Rotate first so completion state is reset before this request attempts
    // to claim today's single play.
    const training = await fetchTrainingProblems();
    
    return (
        <ExtraGame
            gameMode="training"
            timeFormat={EXTRA_GAME_MODES["training"].timeFormat}
            problems={{kind: 'fixed', problems: training.problems}}
            trainingCoefficients={training.coefficients}
        />
    );
}
