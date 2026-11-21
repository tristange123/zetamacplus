import Link from "next/link";
import { ArrowRight, Asterisk, Divide, Music, Dumbbell, Variable, type LucideIcon } from "lucide-react";
import { getTimeFormat } from "@/lib/game/gameModeGlobals";
import { PITCH_GAME_DURATION } from "@/lib/game/pitchGame";

type OtherGameMode = {
    href: string,
    label: string,
    description: string,
    seconds: number,
    icon: LucideIcon,
};

const OTHER_GAME_MODES: OtherGameMode[] = [
    {
        href: "/game/gcd",
        label: "GCD",
        description: "Find the greatest common divisor of as many pairs as you can.",
        seconds: getTimeFormat("gcd") ?? 120,
        icon: Divide,
    },
    {
        href: "/game/lcm",
        label: "LCM",
        description: "Find the least common multiple of as many pairs as you can.",
        seconds: getTimeFormat("lcm") ?? 120,
        icon: Asterisk,
    },
    {
        href: "/game/linear",
        label: "Linear equations",
        description: "Solve for x in as many ax + b = c equations as you can.",
        seconds: getTimeFormat("linear") ?? 120,
        icon: Variable,
    },
    {
        href: "/game/pitch_game",
        label: "Pitch test",
        description: "Identify as many piano notes as you can by ear.",
        seconds: PITCH_GAME_DURATION,
        icon: Music,
    },
    {
        href: "/game/training",
        label: "Training",
        description: "Custom training that targets your weakest standard problems.",
        seconds: getTimeFormat("training") ?? 60,
        icon: Dumbbell,
    },
];

export default function OtherGameModesPage() {
    return (
        <section className="flex min-h-[calc(100vh-9rem)] justify-center pt-[8vh] md:pt-[10vh]">
            <div className="w-full max-w-xl px-3">
                <div className="border-b border-gray-200 pb-4 pt-2">
                    <h1 className="text-base font-semibold text-gray-900 sm:text-lg">Other game modes</h1>
                </div>

                <ul className="divide-y divide-gray-200 border-b border-gray-200">
                    {OTHER_GAME_MODES.map(({ href, label, description, seconds, icon: Icon }) => (
                        <li key={href}>
                            <Link
                                href={href}
                                className="group flex items-center gap-4 py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
                            >
                                <Icon size={20} className="shrink-0 text-gray-500 transition group-hover:text-gray-900" aria-hidden="true" />
                                <span className="min-w-0 flex-1">
                                    <span className="block text-base font-semibold text-gray-800">{label}</span>
                                    <span className="mt-1 block text-sm text-gray-400">{description}</span>
                                </span>
                                <span className="shrink-0 text-sm tabular-nums text-gray-400">{seconds}s</span>
                                <ArrowRight
                                    size={18}
                                    className="shrink-0 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-gray-900"
                                    aria-hidden="true"
                                />
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
