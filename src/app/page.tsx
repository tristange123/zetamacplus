import { headers } from 'next/headers'
import { auth } from '@/lib/auth/auth'
import ClientSide from './startClientSide';

export default async function MainPage(){
  const session = await auth.api.getSession({
    headers: await headers() 
  })
  let userLoggedIn: boolean = true;
  let username: string | null = null;
  if (session == null){
    userLoggedIn = false;
  }
  else{
    username = session.user.name;
  }
  return <ClientSide userLoggedIn = {userLoggedIn} username = {username}></ClientSide>
}
