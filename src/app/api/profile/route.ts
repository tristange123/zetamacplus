import { NextResponse } from "next/server";
import prisma from '@/lib/db/prisma';
import requireSession from '@/lib/auth/requireSession';
import {MAIN_GAME_MODES} from "@/lib/game/gameModeGlobals"

export async function GET(req: Request){
    try{
        const session = await requireSession();   

        const userProfile = await prisma.profile.findMany({
            where: {
                userId: session.user.id
            }
        });
        NextResponse.json(userProfile)
        
        
    }
    catch(err: any){
        console.log(err)
        if (err.message == "Unauthorized"){
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
        if (body.testsAttempted){
            let testsAttempted = userProfile.testsAttempted + (body.testsAttempted ?? 0);
            await prisma.profile.update({
            where: {
                userId: session.user.id
            },
            data: {
                testsAttempted
            }
        })
        }
        

        // update format specific data for completed test
        if (body.score && body.gameMode){
            if (body.gameMode in MAIN_GAME_MODES){
                const gameMode = body.gameMode;

                let pastTenTests = body[`${gameMode}PastTenTests`]
                pastTenTests.unshift(body.score);
                if (pastTenTests.length > 10){
                    pastTenTests.pop();
                }

                let totalTests = body[`${gameMode}TotalTests`];
                let average = (body[`${gameMode}Average`] * totalTests + body.score) / (totalTests + 1);
                totalTests += 1;

                let first = body[`${gameMode}_1`]
                let second = body[`${gameMode}_2`]
                let third = body[`${gameMode}_3`]
                
                if (body.score > first){
                    third = second;
                    second = first;
                    first = body.score;
                }
                else if (body.score > second){
                    third = second;
                    second = body.score;
                }
                else if (body.score > third){
                    third = body.score;
                }

                let testsCompleted = userProfile.testsCompleted + 1;

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
    catch(err: any){
        console.log(err)
        if (err.message == "Unauthorized"){
            return NextResponse.json({error: "Unauthorized User"}, {status: 403});
        }
        else{
            return NextResponse.json({error: "Server Error"}, {status: 500});
        }
    }
}
