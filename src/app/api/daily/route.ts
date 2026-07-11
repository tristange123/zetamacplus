import prisma from "@/lib/db/prisma"
import { NextResponse } from "next/server";
import { Problem } from "@/types/frontendTypes"
import {generateDailyGame} from "@/lib/game/generateDailyGame"


export async function GET(){
    try {
        const dbDateArr = await prisma.dailyDate.findMany();
        if (dbDateArr.length == 0){
            return NextResponse.json({error: "Could not find Daily Date database"}, {status: 404});
        }
        const dbDate = dbDateArr[0]['date'];
        const currDate = new Date()
        let problems: Problem[] = [];
        if (dbDate != currDate){ 
            await prisma.dailyDate.deleteMany();
            await prisma.dailyDate.createMany({
                data: [
                    {date: currDate}
                ]
            });
            problems = generateDailyGame();
            await prisma.daily.deleteMany();
            await prisma.daily.createMany({
                data: problems
            });
        }
        else{
            problems = await prisma.daily.findMany({
                orderBy: {
                    orderNumber:"asc"
                }
            });
        }
        return NextResponse.json(problems);
    }
    catch (err) {
        return NextResponse.json({error: err}, {status: 500});
    }
}