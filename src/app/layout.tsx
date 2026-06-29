import { headers } from 'next/headers'
import { auth } from '@/lib/auth/auth'
import LayoutClientSide from './layoutClientSide';
import {type ReactNode} from 'react'

type MainPageProps  = {
  children : ReactNode
}

export default async function MainPage({children}: MainPageProps){
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
  return <LayoutClientSide userLoggedIn = {userLoggedIn} username = {username}>{children}</LayoutClientSide>
}

