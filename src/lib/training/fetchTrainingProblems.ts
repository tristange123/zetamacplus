import {initModel, bayesUpdate, chooseProblem, printWeights} from "./bayes"
import {type Problem} from "../../types/frontendTypes"
import prisma from "@/lib/db/prisma"
import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'




export default async function fetchTrainingProblems (): Promise<Problem[]>{
    const session = await auth.api.getSession({
        headers: await headers() 
    })

    if (!session){
        return []
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

    printWeights(bayesModel)
    

    return res
}