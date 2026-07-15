import { headers } from 'next/headers'
import { auth } from '@/lib/auth/auth'
import StartClientSide from './startClientSide';


type ProfileDailyStatus = {
  dailyCompleted?: boolean,
  dailyScore?: number
}

async function loadDailyStatus(userLoggedIn: boolean, requestHeaders: Headers) {
  const dailyStatus = {
    dailyCompleted: false,
    dailyScore: null as number | null
  };

  if (!userLoggedIn) return dailyStatus;

  try {
    const protocol = requestHeaders.get('x-forwarded-proto') ?? 'http';
    const host = requestHeaders.get('host');
    if (!host) return dailyStatus;

    const baseUrl = `${protocol}://${host}`;

    await fetch(`${baseUrl}/api/daily`);
    const response = await fetch(`${baseUrl}/api/profile`, {
      headers: {
        cookie: requestHeaders.get('cookie') ?? '',
      },
    });

    if (!response.ok) return dailyStatus;

    const profiles: ProfileDailyStatus[] = await response.json();
    const profile = profiles[0];
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
  const dailyStatus = await loadDailyStatus(userLoggedIn, requestHeaders);

  return <StartClientSide userLoggedIn = {userLoggedIn} username = {username} {...dailyStatus}></StartClientSide>
}
