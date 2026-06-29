'use client'

import {ReactNode} from 'react';
import {GameProvider} from './gameContext';
import { authClient } from '@/lib/auth/auth-client';
import Link from 'next/link';


type LayoutProps = {
  children: ReactNode,
  userLoggedIn: boolean,
  username: string | null
}
export default function LayoutClientSide({children, userLoggedIn, username}: LayoutProps) {
  async function clickSignOut() {
      await authClient.signOut();
  }


  return (
    <html>
        <body>
        <div className="min-h-screen bg-gray-100 text-gray-800">
            <nav className="border-b border-gray-200 bg-gray-50/95 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-lg font-semibold tracking-wide text-gray-700">METAMAC</h1>
                        {userLoggedIn && (
                            <p className="text-sm text-gray-500">
                                Welcome {username}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-3 text-sm font-medium">
                        <Link
                            href="/"
                            className="rounded-md px-3 py-2 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900"
                        >
                            Play
                        </Link>
                        {!userLoggedIn && (
                            <Link
                                href="/login"
                                className="rounded-md px-3 py-2 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900"
                            >
                                Login
                            </Link>
                        )}
                        {userLoggedIn && (
                            <>
                                <Link
                                    href="/stats"
                                    className="rounded-md px-3 py-2 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900"
                                >
                                    My Stats
                                </Link>
                                <button
                                    onClick={clickSignOut}
                                    className="rounded-md bg-gray-800 px-3 py-2 text-gray-100 transition hover:bg-gray-900"
                                >
                                    Sign Out
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </nav>
            <main className="mx-auto flex w-full max-w-6xl justify-center px-6 py-8">
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