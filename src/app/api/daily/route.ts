import { NextResponse } from "next/server";
import { getDailyProblems } from "@/lib/game/dailyGame"

export async function GET(){
    try {
        const problems = await getDailyProblems();
        return NextResponse.json(problems);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load daily game";
        return NextResponse.json({error: message}, {status: 500});
    }
}
