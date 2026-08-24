import Link from "next/link";

export default function VersusAuthGate({ title }: { title: string }) {
    return (
        <section className="flex min-h-[calc(100vh-9rem)] items-center justify-center">
            <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-8 text-center shadow-sm">
                <h1 className="text-2xl font-semibold tracking-tight text-gray-800">{title}</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Log in and verify your email to play versus mode.
                </p>
                <div className="mt-5">
                    <Link
                        href="/"
                        className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
                    >
                        Back
                    </Link>
                </div>
            </div>
        </section>
    );
}
