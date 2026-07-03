import { NextResponse } from "next/server";
import prisma from '@/lib/db/prisma';
import {type Problem} from '@/types/frontendTypes'

type problemRequest = {
    testId : string
    gameMode: string,
    problemSet: Problem[]
}

export async function GET(req: Request){
    try{
        const {searchParams} = new URL(req.url);
        const testId = searchParams.get('testId');
        if (!testId){
            return NextResponse.json({error: 'Missing test id'}, {status: 400});
        }

        const problems = await prisma.problem.findMany({
            where: {
                testId
            },
            orderBy: {
                orderNumber: 'asc'
            }
        });

        return NextResponse.json(problems);
    }
    catch(err: unknown){
        console.log(err);
        return NextResponse.json({error: "Server Error"}, {status: 500});
    }
}

export async function POST(req: Request){
    try{
        const problemRequest: problemRequest = await req.json();
        if (!(problemRequest.testId) || !(problemRequest.gameMode)){
            return NextResponse.json({error: 'Missing Field'}, {status: 400});
        }

        const testId = problemRequest.testId;
        const gameMode = problemRequest.gameMode;
        const problemSet = problemRequest.problemSet;

        for (const problem of problemSet){
            if (typeof problem.firstNum === "number" && typeof problem.secondNum === "number" && typeof problem.answer === "number" && typeof problem.solveTime === "number" && typeof problem.operation === "string" && typeof problem.orderNumber === "number"){
                await prisma.problem.create({
                    data: {
                        firstNum: problem.firstNum,
                        secondNum: problem.secondNum,
                        operation: problem.operation,
                        statement: problem.statement,
                        answer: problem.answer,
                        solveTime: problem.solveTime,
                        orderNumber: problem.orderNumber,
                        testId,
                        gameMode
                    }
                });
            }
            else{
                return NextResponse.json({error: 'Missing Field'}, {status: 400});
            }
        }
        return NextResponse.json({ message: "Successful" });
    }
    catch(err: unknown){
        console.log(err);
        if (err instanceof Error && err.message == "Unauthorized"){
            return NextResponse.json({error: "Unauthorized User"}, {status: 403});
        }
        else{
            return NextResponse.json({error: "Server Error"}, {status: 500});
        }
    }
}