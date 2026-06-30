import { NextResponse } from "next/server";
import prisma from '@/lib/db/prisma';
import optionalSession from '@/lib/auth/optionalSession';


export async function POST(req: Request){
    try{
        const session = await optionalSession();   
        const test = await req.json();
        if (typeof test.score === "number" && typeof test.gameMode === "string"){
            if (session){
                const newTest = await prisma.test.create({
                    data: {
                        score: test.score,
                        gameMode: test.gameMode,
                        time: test.time,
                        userId: session.user.id
                    }
                });
                return NextResponse.json({ testId:  newTest.id});

            }
            else{
                const newTest = await prisma.test.create({
                    data: {
                        score: test.score,
                        gameMode: test.gameMode,
                        time: test.time,
                    }
                });
                return NextResponse.json({ testId:  newTest.id});
            }
        }
        else{
            return NextResponse.json({error: 'Missing Field'}, {status: 400});
        }
    }
    catch(err: any){
        if (err.message == "Unauthorized"){
            return NextResponse.json({error: "Unauthorized User"}, {status: 403});
        }
        else{
            return NextResponse.json({error: "Server Error"}, {status: 500});
        }
    }
}
