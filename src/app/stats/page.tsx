import { headers } from 'next/headers'
import { auth } from '@/lib/auth/auth'
import ClientSide from './clientSide';
import prisma from '@/lib/db/prisma';
import {MAIN_GAME_MODES} from '@/lib/game/gameModeGlobals';
import {type MainGameModeName} from '@/types/frontendTypes';
import {type GameModeTopTests, type ProfileDb, type TestDb} from "@/types/dbTypes"


function buildTopTestsByMode(profile: ProfileDb, testById: Map<string, TestDb>): Record<MainGameModeName, GameModeTopTests> {
    const gameModes = Object.keys(MAIN_GAME_MODES) as MainGameModeName[];

    return gameModes.reduce<Record<MainGameModeName, GameModeTopTests>>((acc, mode) => {
        const firstId = profile[`${mode}_1`];
        const secondId = profile[`${mode}_2`];
        const thirdId = profile[`${mode}_3`];

        acc[mode] = {
            first: firstId ? testById.get(firstId) ?? null : null,
            second: secondId ? testById.get(secondId) ?? null : null,
            third: thirdId ? testById.get(thirdId) ?? null : null,
        };

        return acc;
    }, {} as Record<MainGameModeName, GameModeTopTests>);
}

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
  const tests: TestDb[] = await prisma.test.findMany({
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

  const userProfile = profile[0];
  const gameModes = Object.keys(MAIN_GAME_MODES) as MainGameModeName[];
  const topTestIds = gameModes.flatMap((mode) => [
    userProfile[`${mode}_1`],
    userProfile[`${mode}_2`],
    userProfile[`${mode}_3`],
  ]).filter((testId): testId is string => testId != null);

  const topTests = topTestIds.length > 0
    ? await prisma.test.findMany({
        where: {
            id: {
                in: topTestIds,
            },
            userId,
        },
    })
    : [];

  const testById = new Map(topTests.map((test) => [test.id, test]));
  const topTestsByMode = buildTopTestsByMode(userProfile, testById);

  return <ClientSide tests={tests} profile={userProfile} topTestsByMode={topTestsByMode} />
}
