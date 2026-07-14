import { NextResponse } from "next/server";
import prisma from '@/lib/db/prisma';
import optionalSession from '@/lib/auth/optionalSession';


// export async function PATCH(req: Request){
//     try{
//         const session = await optionalSession();   
//         const test = await req.json();
//         if (typeof test.score === "number" && typeof test.gameMode === "string" && typeof test.testId == "string"){
//             const prevTestArr = await prisma.test.findMany({
//                 where: {
//                     id: test.testId
//                 },
//                 include: {
//                     problems: true,
//                 }
//             })
//             if (prevTestArr.length == 0){
//                 return NextResponse.json({error: 'Could not find test'}, {status: 404});
//             }
//             if (prevTestArr[0]['completed']){
//                 return NextResponse.json(prevTestArr[0], {status: 400});
                
//             }

//             let userId = null
//             if (session){
//                 userId = session.user.id;
//             }

//             const updatedTest = await prisma.test.update({
//                 where: {
//                     id: test.testId
//                 },
//                 data: {
//                     score: test.score,
//                     gameMode: test.gameMode,
//                     time: test.time,
//                     userId,
//                     completed: true
//                 }
//             });
//             return NextResponse.json(updatedTest);
//         }
//         else{
//             return NextResponse.json({error: 'Missing Field'}, {status: 400});
//         }
//     }
//     catch(err: any){
//         if (err.message == "Unauthorized"){
//             return NextResponse.json({error: "Unauthorized User"}, {status: 403});
//         }
//         else{
//             return NextResponse.json({error: "Server Error"}, {status: 500});
//         }
//     }
// }

// creates an incomplete test upon the start
// export async function POST (req:Request) {
//     try{
//         const session = await optionalSession();   
//         const test = await req.json();
//         if (typeof test.gameMode === "string"){
//             let userId = null
//             if (session){
//                 userId = session.user.id;
//             }

//             const created = await prisma.test.create({
//                 data: {
//                     score: 0,
//                     gameMode: test.gameMode,
//                     userId
//                 }
//             });
//             return NextResponse.json(created);
//         }
//         else{
//             return NextResponse.json({error: 'Missing Field'}, {status: 400});
//         }
//     }
//     catch(err: any){
//         if (err.message == "Unauthorized"){
//             return NextResponse.json({error: "Unauthorized User"}, {status: 403});
//         }
//         else{
//             return NextResponse.json({error: "Server Error"}, {status: 500});
//         }
//     }
// }

export async function POST(req: Request){
    try{
        const session = await optionalSession();   
        const test = await req.json();
        if (typeof test.score === "number" && typeof test.gameMode === "string"){

            let userId = null
            if (session){
                userId = session.user.id;
            }

            const newTest = await prisma.test.create({
                data: {
                    score: test.score,
                    gameMode: test.gameMode,
                    time: test.time,
                    userId,
                    completed: true
                }
            });
            return NextResponse.json(newTest);
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