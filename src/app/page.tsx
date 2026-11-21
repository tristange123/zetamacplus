import { headers } from 'next/headers'
import { auth } from '@/lib/auth/auth'
import { getModeStandings, type ModeStandings } from '@/lib/profile/modeStandings'
import StartClientSide from './startClientSide';

export default async function MainPage(){
  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders
  })
  const userLoggedIn = session != null;

  let standings: ModeStandings | null = null;
  if (session?.user.emailVerified) {
    standings = await getModeStandings(session.user.id).catch((error) => {
      console.error('Failed to load mode standings', error);
      return null;
    });
  }

  return <StartClientSide userLoggedIn={userLoggedIn} standings={standings} />
}
