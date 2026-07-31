
'use client'

import {ReactNode} from 'react';
import {GameProvider} from './gameContext';
import { authClient } from '@/lib/auth/auth-client';
import { useRouter } from 'next/navigation'
import {Crown, ChartNoAxesCombined as Chart, Play} from 'lucide-react'
import Link from 'next/link';
import "./globals.css";
import type { Metadata } from "next";


export const metadata: Metadata = {
    metadataBase: new URL("https://zetamacplus.com"),

    title: {
        default: "Zetamac+",
        template: "%s | Zetamac+",
    },

    description:
        "A upgraded version of the popular quant interview math speed game arimetic zetamac. Practice your mental math with adaptive challenges. Log in daily, track your progression and compete on the leaderboard.",
        

    // icons: {
    //     icon: "/favicon.ico",
    // },

    openGraph: {
        title: "Zetamac+",
        description: "Practice your mental math with adaptive challenges. Log in daily, track your progression and compete on the leaderboard.",
        
        // images: ["/og-image.png"],
    },

    // twitter: {
    //     card: "summary_large_image",
    //     title: "Zetamac+",
    //     description: "Practice mental math.",
    //     images: ["/og-image.png"],
    // },
};

type LayoutProps = {
  children: ReactNode
}
export default function LayoutClientSide({children}: LayoutProps) {

  const router = useRouter();

  let userLoggedIn = true;
  let userVerified = true;
  let username;
  const { data } = authClient.useSession();
  if (data == null){
    userLoggedIn = false;
  }
  else{
    username = data.user.name;
    userVerified = data.user.emailVerified;
  }
  const canViewStats = userLoggedIn && userVerified;
  const statsDisabledMessage = userLoggedIn ? "Verify email to view stats" : "Log in to view stats";

  async function clickSignOut() {
      await authClient.signOut();
      router.push("/");
  }
  
//   LOADING SCREEN: not sure if I want to have this

//   if (isPending) {
//     return (
//       <html>
//         <body>
//           <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 text-gray-800">
//             <p className="text-lg font-medium text-gray-700">Loading User Information</p>
//             {/* <Loader2 className="mt-4 h-8 w-8 animate-spin text-gray-600" aria-hidden="true" />
//             <span className="sr-only">Loading</span> */}
//           </div>
//         </body>
//       </html>
//     );
//   }


  return (
    <html>
        <body>
        <div className="min-h-screen bg-gray-100 text-gray-800">
            <nav className="border-b border-gray-200 bg-gray-50/95 backdrop-blur">
                <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:gap-0 md:px-6 md:py-4">
                    <div className="flex w-full items-center justify-between gap-3 md:w-auto md:justify-start">
                        <Link
                            href="/"
                            className="text-lg font-semibold tracking-wide text-gray-700 transition hover:text-gray-900"
                        >
                            ZETAMAC+
                        </Link>
                        {userLoggedIn && (
                            <div className="flex min-w-0 items-center gap-3">
                                <p className="truncate text-xs text-gray-500 sm:text-sm">
                                    Welcome {username}
                                </p>
                                {!userVerified && (
                                    <p className="hidden text-sm text-amber-600 sm:block">
                                        Email verification required
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="grid w-full grid-cols-4 items-center gap-1 text-xs font-medium sm:gap-2 sm:text-sm md:flex md:w-auto md:gap-3">
                        <Link
                            href="/"
                            aria-label="Play"
                            className="flex items-center justify-center gap-1 rounded-md px-1.5 py-2 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900 sm:gap-2 sm:px-3"
                        >
                            <Play size={18} aria-hidden="true" />
                            <span className="hidden sm:inline">Play</span>
                        </Link>
                        <Link
                            href="/leaderboard"
                            aria-label="Leaderboard"
                            className="flex items-center justify-center gap-1 rounded-md px-1.5 py-2 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900 sm:gap-2 sm:px-3"
                        >
                            <Crown size={18} aria-hidden="true" />
                            <span className="hidden sm:inline">Leaderboard</span>
                        </Link>
                        {canViewStats && (
                            <Link
                                href="/stats"
                                aria-label="My Stats"
                                className="flex items-center justify-center gap-1 rounded-md px-1.5 py-2 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900 sm:gap-2 sm:px-3"
                            >
                                <Chart size={18} aria-hidden="true" />
                                <span className="hidden sm:inline">My Stats</span>
                            </Link>
                        )}
                        {!canViewStats && (
                            <div className="group relative">
                                <button
                                    type="button"
                                    aria-label="My Stats"
                                    aria-describedby="stats-disabled-tooltip"
                                    aria-disabled="true"
                                    className="peer flex w-full cursor-not-allowed items-center justify-center gap-1 rounded-md px-1.5 py-2 text-gray-300 sm:gap-2 sm:px-3"
                                >
                                    <Chart size={18} aria-hidden="true" />
                                    <span className="hidden sm:inline">My Stats</span>
                                </button>
                                <div
                                    id="stats-disabled-tooltip"
                                    role="tooltip"
                                    className="pointer-events-none absolute right-0 top-full z-10 mt-2 hidden whitespace-nowrap rounded-md bg-gray-800 px-3 py-2 text-xs font-medium text-gray-100 shadow-lg peer-hover:block peer-focus:block"
                                >
                                    {statsDisabledMessage}
                                </div>
                            </div>
                        )}
                        {!userLoggedIn && (
                            <Link
                                href="/login"
                                className="flex justify-center rounded-md px-1.5 py-2 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900 sm:px-3"
                            >
                                Login
                            </Link>
                        )}
                        {userLoggedIn && (
                            <button
                                onClick={clickSignOut}
                                className="rounded-md bg-gray-800 px-1.5 py-2 text-gray-100 transition hover:bg-gray-900 sm:px-3"
                            >
                                Sign Out
                            </button>
                        )}
                    </div>
                </div>
            </nav>
            <main className="mx-auto flex w-full max-w-6xl justify-center px-4 py-5 md:px-6 md:py-8">
                <div className="w-full">
                    <GameProvider> 
                        {children}
                    </GameProvider>
                </div>
            </main>
        </div>
      </body>
    </html>
  );
}
