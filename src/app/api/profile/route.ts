import { NextResponse } from "next/server";
import prisma from '@/lib/db/prisma';
import requireSession from '@/lib/auth/requireSession';
import {MAIN_GAME_MODES} from "@/lib/game/gameModeGlobals"
import {type MainGameModeName} from "@/types/frontendTypes"

function isMainGameModeName(gameMode: string): gameMode is MainGameModeName {
    return gameMode in MAIN_GAME_MODES;
}

export async function GET(){
    try{
        const session = await requireSession();   

        const userProfile = await prisma.profile.findMany({
            where: {
                userId: session.user.id
            }
        });
        return NextResponse.json(userProfile)
        
        
    }
    catch(err: unknown){
        console.log(err)
        if (err instanceof Error && err.message == "Unauthorized"){
            return NextResponse.json({error: "Unauthorized User"}, {status: 403});
        }
        else{
            return NextResponse.json({error: "Server Error"}, {status: 500});
        }
    }
}

export async function POST (req: Request){
    try {
        const body = await req.json();
        if (body.username && body.email && body.timeJoined && body.userId){
            await prisma.profile.create({
                data: {
                    username: body.username,
                    email: body.email,
                    timeJoined: body.timeJoined,
                    userId: body.userId
                }
            });
            return NextResponse.json({username: body.username, email: body.email, timeJoined: body.timeJoined, userId: body.userId});
        }
        else{
            return NextResponse.json({error: "Missing fields"}, {status: 400});
        }
    }
    catch (err){
        console.log(err);
        return NextResponse.json({error: "Sever Error"}, {status: 500});
    }
}

export async function PATCH(req: Request){
    try{
        const session = await requireSession();  
        const body = await req.json();

        const profileQuery = await prisma.profile.findMany({
            where: {
                userId: session.user.id
            }
        });

        if (profileQuery.length == 0){
            return NextResponse.json({error: "Prolile Not Found"}, {status: 404});
        }
        const userProfile = profileQuery[0];



        // update general data for incomplete test
        if (typeof body.testsAttempted === "number"){
            const testsAttempted = userProfile.testsAttempted + body.testsAttempted;
            await prisma.profile.update({
                where: {
                    userId: session.user.id
                },
                data: {
                    testsAttempted
                }
            });
            console.log(body.testsAttempted);

        }
        console.log(body);
        

        // update format specific data for completed test
        if (typeof body.gameMode === "string" && typeof body.testId === "string" && typeof body.score === "number"){
            if (isMainGameModeName(body.gameMode)){
                const gameMode: MainGameModeName = body.gameMode;
                if (typeof body.testId !== "string"){
                    return NextResponse.json({error: "Missing test id"}, {status: 400});
                }

                const pastTenTests = [...userProfile[`${gameMode}PastTenTests`]]
                pastTenTests.unshift(body.score);
                if (pastTenTests.length > 10){
                    pastTenTests.pop();
                }

                let totalTests = userProfile[`${gameMode}TotalTests`];
                const average = (userProfile[`${gameMode}Average`] * totalTests + body.score) / (totalTests + 1);
                totalTests += 1;

                let first = userProfile[`${gameMode}_1`]
                let second = userProfile[`${gameMode}_2`]
                let third = userProfile[`${gameMode}_3`]
                const currentTopTestIds = [first, second, third].filter((testId): testId is string => testId !== null);
                const currentTopTests = await prisma.test.findMany({
                    where: {
                        id: {
                            in: currentTopTestIds
                        },
                        userId: session.user.id
                    },
                    select: {
                        id: true,
                        score: true
                    }
                });
                const scoreByTestId = new Map(currentTopTests.map((test) => [test.id, test.score]));
                const firstScore = first ? scoreByTestId.get(first) ?? Number.NEGATIVE_INFINITY : Number.NEGATIVE_INFINITY;
                const secondScore = second ? scoreByTestId.get(second) ?? Number.NEGATIVE_INFINITY : Number.NEGATIVE_INFINITY;
                const thirdScore = third ? scoreByTestId.get(third) ?? Number.NEGATIVE_INFINITY : Number.NEGATIVE_INFINITY;
                
                if (body.score > firstScore){
                    third = second;
                    second = first;
                    first = body.testId;
                }
                else if (body.score > secondScore){
                    third = second;
                    second = body.testId;
                }
                else if (body.score > thirdScore){
                    third = body.testId;
                }

                const testsCompleted = userProfile.testsCompleted + 1;

                await prisma.profile.update({
                    where: {
                        userId: session.user.id
                    },
                    data: {
                        [`${gameMode}PastTenTests`]: pastTenTests,
                        [`${gameMode}Average`]: average,
                        [`${gameMode}TotalTests`]: totalTests,
                        [`${gameMode}_1`]: first,
                        [`${gameMode}_2`]: second,
                        [`${gameMode}_3`]: third,
                        testsCompleted
                    }
                });
            }
        }
        return NextResponse.json({message: "Successful post"}, {status: 201});
    }
    catch(err: unknown){
        console.log(err)
        if (err instanceof Error && err.message == "Unauthorized"){
            return NextResponse.json({error: "Unauthorized User"}, {status: 403});
        }
        else{
            return NextResponse.json({error: "Server Error"}, {status: 500});
        }
    }
}
