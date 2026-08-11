import { headers } from 'next/headers'
import { auth } from '@/lib/auth/auth'
import prisma from '@/lib/db/prisma'
import { refreshDailyGame } from '@/lib/game/dailyGame'
import StartClientSide from './startClientSide';


async function loadDailyStatus(userId: string | null) {
  const dailyStatus = {
    dailyCompleted: false,
    dailyScore: null as number | null
  };

  if (!userId) return dailyStatus;

  try {
    // Must run before reading the profile: a new day resets dailyCompleted
    await refreshDailyGame();

    const profile = await prisma.profile.findUnique({
      where: {
        userId
      },
      select: {
        dailyCompleted: true,
        dailyScore: true
      }
    });

    if (!profile?.dailyCompleted) {
      return dailyStatus;
    }

    return {
      dailyCompleted: true,
      dailyScore: profile.dailyScore ?? 0,
    };
  }
  catch(err){
    console.log(err);
    return dailyStatus;
  }
}

export default async function MainPage(){
  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders
  })
  let userLoggedIn: boolean = true;
  let username: string | null = null;
  if (session == null){
    userLoggedIn = false;
  }
  else{
    username = session.user.name;
  }
  const dailyStatus = await loadDailyStatus(session?.user.id ?? null);

  return <StartClientSide userLoggedIn = {userLoggedIn} username = {username} {...dailyStatus}></StartClientSide>
}
