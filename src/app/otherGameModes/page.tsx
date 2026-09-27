import Link from "next/link";
import { ArrowRight, Music } from "lucide-react";

export default function OtherGameModesPage() {
    return (
        <section className="flex min-h-[calc(100vh-11rem)] flex-col items-center pb-2 md:min-h-[calc(100vh-9rem)]">
            <div className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 p-4 shadow-sm md:p-8">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight text-gray-800 md:text-3xl">
                        Other game modes
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Try a different kind of speed test.
                    </p>
                </div>

                <ul className="space-y-3">
                    <li>
                        <Link
                            href="/game/pitch_game"
                            className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow md:p-5"
                        >
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                                <Music size={24} aria-hidden="true" />
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block font-semibold text-gray-800">Pitch test</span>
                                <span className="mt-1 block text-sm text-gray-500">
                                    Identify as many piano notes as you can in 120 seconds.
                                </span>
                            </span>
                            <ArrowRight
                                size={18}
                                className="shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5"
                                aria-hidden="true"
                            />
                        </Link>
                    </li>
                </ul>
            </div>
        </section>
    );
}
