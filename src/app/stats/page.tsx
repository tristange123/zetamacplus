import { headers } from 'next/headers'
import { auth } from '@/lib/auth/auth'
import ClientSide from './clientSide';
import prisma from '@/lib/db/prisma';
import {type TestDb, type ProfileDb} from "@/types/dbTypes"


export default async function MainPage(){
  const session = await auth.api.getSession({
    headers: await headers() 
  })
  if (session == null){
     return (
        <div className="flex min-h-[calc(100vh-9rem)] items-center justify-center">
            <p className="text-sm text-gray-600">Log in to see stats.</p>
        </div>
    );
  }
  if (!session.user.emailVerified){
     return (
        <div className="flex min-h-[calc(100vh-9rem)] items-center justify-center">
            <p className="text-sm text-gray-600">Verify email to see stats.</p>
        </div>
    );
  }
  const userId = session.user.id;
  const tests:TestDb[] = await prisma.test.findMany({
    where: {
        userId
    },
    orderBy: {
      time: "desc",
    },
  })
  const profile: ProfileDb[] = await prisma.profile.findMany({
    where: {
        userId
    }
  })
  if (profile.length == 0){
    return <div>No profile found </div>
  }


  

  return <ClientSide tests = {tests} profile = {profile[0]} /> 
}