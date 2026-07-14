"use client"

import { type Problem, type ProblemType, type GameModeName, type OperationBounds } from '@/types/frontendTypes'
import {generateProblem} from '@/lib/game/generateProblem'
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useGameContext} from '@/app/gameContext'



export default function Game() {
    // Load gameContext
    const router = useRouter();
    const context = useGameContext();
    const [timeFormat, setTimeFormat] = useState<number>(context.timeFormat);
    const [operations, setOperations] = useState<OperationBounds>({'+': {first: [2,100], second: [2,100]},  '-': {first: [2,100], second: [2,100]},  '*': {first: [2,100], second: [2,12]}, '/': {first: [2,100], second: [2,12]}});
    // Gameplay States
    const [currProblem, setCurrProblem] = useState<Problem>();
   
    const [display, setDisplay] = useState('');
    const [inputKey, setInputKey] = useState(0);
    const [score, setScore] = useState(0);
    const [time, setTime] = useState<number>(context.timeFormat);
    const [finished, setFinished] = useState(false);


    // Track Stats
    const solveTimes= useRef<number[]>([]);
    const testsAttempted = useRef<number>(1);
    const pastProblems = useRef<Problem[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    
    
    async function updateTestsAttempted () {
        try{
            await fetch('/api/profile', {
                method: 'PATCH',
                headers: { "Content-Type": 'application/json'},
                body: JSON.stringify({testsAttempted: testsAttempted.current})
            });
        }
        catch (err){
            console.log(err);
        }
    }

    // timer logic
    useEffect(() => {

        setOperations(JSON.parse(localStorage.getItem("operations") ?? "{'+': {first: [2,100], second: [2,100]},  '-': {first: [2,100], second: [2,100]},  '*': {first: [2,100], second: [2,12]}, '/': {first: [2,100], second: [2,12]}}"));
        setTimeFormat(Number(localStorage.getItem("timeFormat") ?? "120"));
        setTime(Number(localStorage.getItem("timeFormat") ?? "120"));
        setCurrProblem(generateProblem(JSON.parse(localStorage.getItem("operations") ?? "{'+': {first: [2,100], second: [2,100]},  '-': {first: [2,100], second: [2,100]},  '*': {first: [2,100], second: [2,12]}, '/': {first: [2,100], second: [2,12]}}"), 1))
        const timeId = setInterval(() => {setTime((t) => {
                if (t > 0){
                    return t - 0.1;
                }
                else{
                    return t
                }
            })
        }, 100);
        return () => {clearInterval(timeId)};
    }, []);
    
    // Handle Game Finish
    useEffect(()=> {
        if (time <= 0 && !finished){
            setFinished(true);
            context?.setTestsAttempted(testsAttempted.current);
            context?.setProblemSet(pastProblems.current);
            context?.setScore(score);

            localStorage.setItem("testsAttempted", JSON.stringify(testsAttempted.current));
            localStorage.setItem("problemSet", JSON.stringify(pastProblems.current));
            localStorage.setItem("score", String(score));

            router.replace('results');
        }
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
            if(currProblem) {
                let currProblemTimed = currProblem;
                
                currProblemTimed.solveTime = timeSpent;
                currProblemTimed.orderNumber = score;
                pastProblems.current.push(currProblemTimed);
                solveTimes.current.push(time);

                setScore(score + 1);
                setDisplay('');

                let newProb:Problem = generateProblem(operations, score + 1);
                setCurrProblem(newProb);
            }
        }
    }

    async function reset(){
        setScore(0)
        setTime(timeFormat);
        setDisplay('');
        setInputKey((k) => k + 1);
        testsAttempted.current = testsAttempted.current + 1;
        pastProblems.current = [];
        solveTimes.current = [];
        let newProb: Problem = generateProblem(operations, 0)
        setCurrProblem(newProb);
        inputRef.current?.focus();
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
                        <h2 className="text-6xl font-semibold tracking-tight text-gray-800 md:text-5xl">
                            {currProblem?.statement}
                        </h2>
                        <input
                            key={inputKey}
                            ref={inputRef}
                            autoFocus
                            type="number"
                            value={display}
                            onChange={(e) => checkDisplay(e, currProblem?.answer ?? 999)}
                            className="w-48 rounded-md border border-gray-300 bg-white px-4 py-3 text-center text-[1.6875rem] text-gray-800 shadow-sm outline-none transition [appearance:textfield] focus:border-gray-500 focus:ring-2 focus:ring-gray-300 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
                        onClick={() => {
                            updateTestsAttempted();
                            router.back();
                        }}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                    >
                        Back
                    </button>
                </div>
            </div>
            
        </section>
    );
} 