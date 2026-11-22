import { headers } from 'next/headers'
import { auth } from '@/lib/auth/auth'
import { getModeStandings, type ModeStandings } from '@/lib/profile/modeStandings'
import prisma from '@/lib/db/prisma'
import StartClientSide from './startClientSide';

export default async function MainPage(){
  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders
  })
  const userLoggedIn = session != null;

  let standings: ModeStandings | null = null;
  let standardGamesPlayed = 0;
  if (session?.user.emailVerified) {
    const [loadedStandings, profile] = await Promise.all([
      getModeStandings(session.user.id).catch((error) => {
        console.error('Failed to load mode standings', error);
        return null;
      }),
      prisma.profile.findUnique({
        where: { userId: session.user.id },
        select: { standardTotalTests: true },
      }).catch(() => null),
    ]);
    standings = loadedStandings;
    standardGamesPlayed = profile?.standardTotalTests ?? 0;
  }

  return <StartClientSide userLoggedIn={userLoggedIn} standings={standings} standardGamesPlayed={standardGamesPlayed} />
}
