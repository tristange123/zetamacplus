import { NextResponse } from "next/server";
import requireSession from "@/lib/auth/requireSession";
import prisma from "@/lib/db/prisma";
import { bayesUpdate, initModel, weightTable } from "@/lib/training/bayes";
import { type Problem } from "@/types/frontendTypes";

type TrainingResultRequest = {
    score: number;
    problems: Problem[];
};

function isCompletedProblem(problem: Problem): problem is Problem & {solveTime: number} {
    return (
        typeof problem.firstNum === "number"
        && typeof problem.secondNum === "number"
        && typeof problem.answer === "number"
        && typeof problem.solveTime === "number"
        && typeof problem.operation === "string"
        && typeof problem.statement === "string"
        && typeof problem.orderNumber === "number"
    );
}

export async function POST(request: Request) {
    try {
        const session = await requireSession();
        const body = await request.json() as TrainingResultRequest;
        const completedProblems = Array.isArray(body.problems)
            ? body.problems.filter(isCompletedProblem)
            : [];

        if (
            !Number.isInteger(body.score)
            || body.score < 0
            || !Array.isArray(body.problems)
            || completedProblems.length !== body.problems.length
            || body.score !== completedProblems.length
        ) {
            return NextResponse.json({error: "Invalid training result"}, {status: 400});
        }

        const completedAt = new Date();

        const coefficients = await prisma.$transaction(async (transaction) => {
            await transaction.test.create({
                data: {
                    score: body.score,
                    time: completedAt,
                    gameMode: "training",
                    userId: session.user.id,
                    completed: true,
                    problems: {
                        create: completedProblems.map((problem) => ({
                            firstNum: problem.firstNum,
                            secondNum: problem.secondNum,
                            operation: problem.operation,
                            statement: problem.statement,
                            answer: problem.answer,
                            solveTime: problem.solveTime,
                            orderNumber: problem.orderNumber,
                            gameMode: "training",
                        })),
                    },
                },
            });

            const recentTests = await transaction.test.findMany({
                include: {
                    problems: true,
                },
                where: {
                    userId: session.user.id,
                    gameMode: {
                        in: ["standard", "training"],
                    },
                    completed: true,
                },
                orderBy: {
                    time: "desc",
                },
                take: 15,
            });

            const model = initModel();
            for (const test of recentTests) {
                for (const problem of test.problems) {
                    bayesUpdate(model, problem);
                }
            }

            return weightTable(model);
        });

        return NextResponse.json({coefficients}, {status: 201});
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({error: "Unauthorized User"}, {status: 403});
        }

        console.error(error);
        return NextResponse.json({error: "Server Error"}, {status: 500});
    }
}
