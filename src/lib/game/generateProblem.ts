import {type Problem} from '@/types/frontendTypes'

function randomInt(bottom: number, top: number){
    let seed = Math.random() * (top - bottom + 1);
    seed += bottom;
    return Math.floor(seed);

}

const bounds: Record <string, Record<string, Record<string, number[]>>> = 
        {'standard':{
            '+': {first: [2,100], second: [2,100]}, 
            '-': {first: [2,100], second: [2,100]}, 
            '*': {first: [2,100], second: [2,12]}, 
            '/': {first: [2,100], second: [2,12]}
        }, 
         'easy': {
            '+': {first: [2,10], second: [2,10]}, 
            '-': {first: [2,10], second: [2,10]}, 
            '*': {first: [2,10], second: [2,10]}, 
            '/': {first: [2,10], second: [2,10]}
        },
         'hard': {
            '+': {first: [50,1000], second: [50,1000]}, 
            '-': {first: [50,1000], second: [50,1000]}, 
            '*': {first: [20,100], second: [5,25]}, 
            '/': {first: [20,100], second: [5,25]}
        }
        };

function chooseOperation(operations: Record<string,boolean>){
    const mappings: Record <number, string>= {}
    let inc: number = 1;
    Object.entries(operations).forEach(([operation, valid]) => {
        if (valid){
            mappings[inc] = operation;
            inc += 1;
        }
    })
    return mappings[randomInt(1, inc - 1)]
}



export default function generateProblem(problemType: string, operations: Record<string,boolean>): Problem{
    let operation = chooseOperation(operations);
    if (operation === '+'){
        let first = randomInt(bounds[problemType]['+']['first'][0], bounds[problemType]['+']['first'][1]);
        let sec = randomInt(bounds[problemType]['+']['second'][0], bounds[problemType]['+']['second'][1]);
        return {'operation': '+', 'firstNum': first, 'secondNum': sec, 'answer': first + sec, 'statement': String(first) + ' + ' + String(sec) + ' = ', 'solveTime': null};
    }
    else if (operation === '-'){
        let first = randomInt(bounds[problemType]['-']['first'][0], bounds[problemType]['-']['first'][1]);
        let sec = randomInt(bounds[problemType]['-']['second'][0], bounds[problemType]['-']['second'][1]);
        return {'operation': '-', 'firstNum': first + sec, 'secondNum': sec, 'answer': first, 'statement': String(first + sec) + ' - ' + String(sec) + ' = ', 'solveTime': null};
    }
    else if (operation === '*'){
        let first = randomInt(bounds[problemType]['*']['first'][0], bounds[problemType]['*']['first'][1]);
        let sec = randomInt(bounds[problemType]['*']['second'][0], bounds[problemType]['*']['second'][1]);
        return {'operation': '*', 'firstNum': first, 'secondNum': sec, 'answer': first * sec, 'statement': String(first) + ' * ' + String(sec) + ' = ', 'solveTime': null};
    }

    else{
        let sec = randomInt(bounds[problemType]['/']['second'][0], bounds[problemType]['/']['second'][1]);
        let first = sec * randomInt(bounds[problemType]['/']['first'][0], bounds[problemType]['/']['first'][1]);
        return {'operation': '/', 'firstNum': first, 'secondNum': sec, 'answer': Math.floor(first / sec), 'statement': String(first) + ' / ' + String(sec) + ' = ', 'solveTime': null};
    }
}



