import { headers } from 'next/headers'
import { auth } from '@/lib/auth/auth'
import StartClientSide from './startClientSide';

export default async function MainPage(){
  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders
  })
  let userLoggedIn: boolean = true;
  if (session == null){
    userLoggedIn = false;
  }

  return <StartClientSide userLoggedIn={userLoggedIn} />
}
