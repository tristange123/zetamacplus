
'use client'

import {ReactNode, useEffect, useRef, useState} from 'react';
import {GameProvider} from './gameContext';
import { authClient } from '@/lib/auth/auth-client';
import { useRouter } from 'next/navigation'
import {Crown, ChartNoAxesCombined as Chart, LogOut, Play, Settings as SettingsIcon, UserRound} from 'lucide-react'
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
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [profileUsername, setProfileUsername] = useState<{userId: string, username: string} | null>(null);

  const { data } = authClient.useSession();
  const sessionUserId = data?.user.id ?? null;
  const username = profileUsername?.userId === sessionUserId ? profileUsername.username : null;
  const userLoggedIn = data != null;
  const userVerified = data?.user.emailVerified ?? false;
  const canViewStats = userLoggedIn && userVerified;
  const statsDisabledMessage = userLoggedIn ? "Verify email to view stats" : "Log in to view stats";

  async function clickSignOut() {
      setUserMenuOpen(false);
      await authClient.signOut();
      router.push("/");
  }

  useEffect(() => {
      if (!userMenuOpen) return;

      function handleClickOutside(event: MouseEvent) {
          if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
              setUserMenuOpen(false);
          }
      }

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  useEffect(() => {
      if (!sessionUserId) return;

      const userId = sessionUserId;
      const controller = new AbortController();
      let latestRequest = 0;

      async function loadUsername() {
          const requestNumber = ++latestRequest;

          try {
              const response = await fetch("/api/profile/username", {
                  signal: controller.signal,
              });
              if (!response.ok) return;

              const profile = await response.json() as { username?: unknown };
              if (requestNumber === latestRequest && typeof profile.username === "string") {
                  setProfileUsername({
                      userId,
                      username: profile.username,
                  });
              }
          }
          catch (error) {
              if (!(error instanceof DOMException && error.name === "AbortError")) {
                  console.error("Failed to load profile username", error);
              }
          }
      }

      function handleUsernameChanged() {
          void loadUsername();
      }

      void loadUsername();
      window.addEventListener("profile-username-changed", handleUsernameChanged);

      return () => {
          controller.abort();
          window.removeEventListener("profile-username-changed", handleUsernameChanged);
      };
  }, [sessionUserId]);
  
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
            <nav className="relative z-50 border-b border-gray-200 bg-gray-50/95 backdrop-blur">
                <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3 px-4 py-3 md:gap-y-0 md:px-6 md:py-4">
                    <div className="col-start-1 row-start-1 flex min-w-0 items-center gap-3">
                        <Link
                            href="/"
                            className="text-lg font-semibold tracking-wide text-gray-700 transition hover:text-gray-900"
                        >
                            ZETAMAC+
                        </Link>
                        {userLoggedIn && username !== null && (
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
                    <div className="contents md:col-start-2 md:row-start-1 md:flex md:items-center md:justify-end md:gap-2">
                    <div className="col-span-2 row-start-2 grid w-full grid-cols-2 items-center gap-3 text-xs font-medium sm:gap-4 sm:text-sm md:flex md:w-auto md:gap-2">
                        <Link
                            href="/"
                            aria-label="Play"
                            title="Play"
                            className="flex items-center justify-center gap-1 rounded-md px-1.5 py-2 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900 sm:gap-2 sm:px-3"
                        >
                            <Play size={18} aria-hidden="true" />
                            <span>Play</span>
                        </Link>
                        <Link
                            href="/leaderboard"
                            aria-label="Leaderboard"
                            title="Leaderboard"
                            className="flex items-center justify-center gap-1 rounded-md px-1.5 py-2 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900 sm:gap-2 sm:px-3"
                        >
                            <Crown size={18} aria-hidden="true" />
                            <span>Leaderboard</span>
                        </Link>
                    </div>
                    <div className="col-start-2 row-start-1 flex items-center justify-end text-xs font-medium sm:text-sm md:ml-1 md:border-l md:border-gray-300 md:pl-3">
                        {!userLoggedIn && (
                            <Link
                                href="/login"
                                aria-label="Login"
                                title="Login"
                                className="flex items-center justify-center gap-1 rounded-md px-1.5 py-2 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900 sm:gap-2 sm:px-3"
                            >
                                <UserRound size={18} aria-hidden="true" />
                            </Link>
                        )}
                        {userLoggedIn && (
                            <div ref={userMenuRef} className="relative z-50 flex justify-center">
                                <button
                                    type="button"
                                    aria-label="User menu"
                                    aria-haspopup="menu"
                                    aria-expanded={userMenuOpen}
                                    title="User menu"
                                    onClick={() => setUserMenuOpen((open) => !open)}
                                    className="flex items-center justify-center rounded-md px-1.5 py-2 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900 focus:bg-gray-200 focus:text-gray-900 sm:px-3"
                                >
                                    <UserRound size={18} aria-hidden="true" />
                                </button>
                                <div
                                    role="menu"
                                    className={`absolute right-0 top-full z-[100] w-44 pt-2 ${userMenuOpen ? "block" : "hidden"}`}
                                >
                                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
                                        {canViewStats ? (
                                            <Link
                                                href="/stats"
                                                role="menuitem"
                                                onClick={() => setUserMenuOpen(false)}
                                                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
                                            >
                                                <Chart size={16} aria-hidden="true" />
                                                Stats
                                            </Link>
                                        ) : (
                                            <button
                                                type="button"
                                                role="menuitem"
                                                disabled
                                                title={statsDisabledMessage}
                                                className="flex w-full cursor-not-allowed items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-400"
                                            >
                                                <Chart size={16} aria-hidden="true" />
                                                Stats
                                            </button>
                                        )}
                                        <Link
                                            href="/settings"
                                            role="menuitem"
                                            onClick={() => setUserMenuOpen(false)}
                                            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
                                        >
                                            <SettingsIcon size={16} aria-hidden="true" />
                                            Settings
                                        </Link>
                                        <button
                                            type="button"
                                            role="menuitem"
                                            onClick={clickSignOut}
                                            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 hover:text-red-700"
                                        >
                                            <LogOut size={16} aria-hidden="true" />
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
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
