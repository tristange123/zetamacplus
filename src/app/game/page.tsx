"use client"

import { type Problem, type ProblemType, type GameModeName } from '@/types/frontendTypes'
import generateProblem from '@/lib/game/generateProblem'
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useGameContext} from '@/app/gameContext'




export default function Game() {
    // Load gameContext
    const router = useRouter();
    const context = useGameContext();
    const timeFormat = context?.timeFormat ?? 120;
    const problemType: ProblemType = context?.problemType ?? 'medium';
    const operations = context?.operations ?? {'+': true, '-':true, '*':true, '/':true};
    const gameMode: GameModeName = context?.gameMode ?? 'standard'

    // Gameplay States
    const [currProblem, setCurrProblem] = useState<Problem>(() => generateProblem(problemType, operations));
    const [display, setDisplay] = useState('');
    const [score, setScore] = useState(0);
    const [time, setTime] = useState(timeFormat);
    const [finished, setFinished] = useState(false);


    // Track Stats
    const solveTimes= useRef<number[]>([]);
    const testsAttempted = useRef<number>(1);
    const pastProblems = useRef<Problem[]>([]);

    // Increment Tests Attempted when user closes the page
    // useEffect(() => {
    //     return () => {
    //         async function updateUserDataFunction () {
    //             try{
    //                 await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`, {
    //                     method: 'PATCH',
    //                     headers: { "Content-Type": 'application/json'},
    //                     body: JSON.stringify({testsAttempted: testsAttempted.current})
    //                 });
    //             }
    //             catch (err){
    //                 console.log(err);
    //             }
    //         }
    //         updateUserDataFunction();
    //     };
    // }, [])

    // timer logic
    useEffect(() => {
        if (finished){
            return;
        }
        const timeId = setInterval(() => {setTime((t) => {
                return t - 0.1;
            })
        }, 100);
        return () => {clearInterval(timeId)};
    }, []);
    
    // Handle Game Finish
    useEffect(()=> {
        async function handleFinish(){
            if (time <= 0 && (!finished)){
                setFinished(true);
                const now = new Date();
                try{
                    const testRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/test`, {
                        method: 'POST',
                        headers: { "Content-Type": 'application/json'},
                        body: JSON.stringify({score, time: now, gameMode})
                    });
                    const testJson = await testRes.json();
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`, {
                        method: 'PATCH',
                        headers: { "Content-Type": 'application/json'},
                        body: JSON.stringify({score, gameMode, testsAttempted: testsAttempted.current})
                    });
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/problem`, {
                        method: 'POST',
                        headers: { "Content-Type": 'application/json'},
                        body: JSON.stringify({testId: testJson.testId, gameMode, problemSet: pastProblems.current})
                    });
                    router.replace(`results/${testJson.testId}`);
                } catch (err){
                    console.log(err);
                }
            }
        }
        handleFinish();
    }, [time, finished]);


    function checkDisplay(e: React.ChangeEvent<HTMLInputElement>, answer: number){
        const val = e.target.value;
        setDisplay(val);
        if (Number(val) === answer){

            let timeSpent;
            if (solveTimes.current.length == 0){
                timeSpent = timeFormat - time;
            }
            else{
                timeSpent = solveTimes?.current[solveTimes.current.length - 1] - time;
            }

            let currProblemTimed = currProblem;
            currProblemTimed.solveTime = timeSpent;
            currProblemTimed.orderNumber = score;
            pastProblems.current.push(currProblemTimed);
            solveTimes.current.push(time);

            setScore(score + 1);
            setDisplay('');

            let newProb:Problem = generateProblem(problemType, operations);
            setCurrProblem(newProb);
        }
    }

    async function reset(){
        setScore(0)
        setTime(timeFormat);
        testsAttempted.current = testsAttempted.current + 1;
        pastProblems.current = [];
        solveTimes.current = [];
        let newProb: Problem = generateProblem(problemType, operations)
        setCurrProblem(newProb);
    }


    
    

    return (
        <section className="relative flex min-h-[calc(100vh-9rem)] flex-col justify-center">
            <div className="absolute top-0 left-0 right-0 mx-auto flex w-full max-w-6xl items-center justify-between px-6 pb-6 text-xs font-medium text-gray-500 md:text-sm">
                <p>Score: {score}</p>
                <p>Time: {Math.ceil(time)}</p>
            </div>

            <div className="-mt-40 flex flex-col justify-center">
                <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 bg-gray-200 py-8">
                    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-4 px-6">
                        <h2 className="text-2xl font-semibold tracking-tight text-gray-800 md:text-3xl">
                            {currProblem.statement}
                        </h2>
                        <input
                            type="number"
                            value={display}
                            onChange={(e) => checkDisplay(e, currProblem.answer)}
                            className="w-32 rounded-md border border-gray-300 bg-white px-3 py-2 text-center text-lg text-gray-800 shadow-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-300"
                        />
                    </div>
                </div>

                <div className="mx-auto flex w-full max-w-6xl justify-center gap-3 px-6 pt-4">
                    <button
                        onClick={reset}
                        className="rounded-md border border-gray-300 bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300"
                    >
                        Restart
                    </button>
                    <button
                        onClick={() => router.back()}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                    >
                        Back
                    </button>
                </div>
            </div>
            
        </section>
    );
} 

