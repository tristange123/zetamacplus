import {initModel, bayesUpdate, chooseProblem, weightTable, type TrainingCoefficient} from "./bayes"
import {type Problem} from "../../types/frontendTypes"
import prisma from "@/lib/db/prisma"
import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'

export default async function fetchTrainingProblems (): Promise<{
    problems: Problem[],
    coefficients: TrainingCoefficient[],
}>{
    const session = await auth.api.getSession({
        headers: await headers() 
    })

    if (!session){
        return {problems: [], coefficients: []}
    }

    const userId = session.user.id;

    const recentTests = await prisma.test.findMany({
        include: {
            problems:{
            }
        },
        where: {
            userId
        },
        orderBy: {
            time: "desc"
        },
        take: 15
    });

    const bayesModel = initModel()

    for (const test of recentTests){
        for (const problem of test.problems){
            bayesUpdate(bayesModel, problem)
        }
    }

    const res = []
    
    for (let i = 0; i < 1000; i++){
        res.push(chooseProblem(bayesModel))
    }

    return {
        problems: res,
        coefficients: weightTable(bayesModel),
    }
}