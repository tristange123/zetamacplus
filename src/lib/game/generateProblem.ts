import {type Problem, type MainGameModeName, type ProblemType, type Operation} from '@/types/frontendTypes'

function randomInt(bottom: number, top: number){
    let seed = Math.random() * (top - bottom + 1);
    seed += bottom;
    return Math.floor(seed);

}



function chooseOperation(operations: Record<Operation,Record<string, number[]>>): Operation{
    const mappings: Record <number, Operation>= {}
    let inc: number = 1;
    for (const operation in operations) {
        mappings[inc] = operation;
        inc += 1;
    }
    return mappings[randomInt(1, inc - 1)]
}



export default function generateProblem(operations: Record<Operation,Record<string, number[]>>): Problem{
    let operation: Operation = chooseOperation(operations);
    if (operation === '+'){
        let first = randomInt(operations[operation]['first'][0], operations[operation]['first'][1]);
        let sec = randomInt(operations[operation]['second'][0], operations[operation]['second'][1]);
        return {'operation': '+', 'firstNum': first, 'secondNum': sec, 'answer': first + sec, 'statement': String(first) + ' + ' + String(sec) + ' = ', 'solveTime': null, 'orderNumber' : null};
    }
    else if (operation === '-'){
        let first = randomInt(operations[operation]['first'][0], operations[operation]['first'][1]);
        let sec = randomInt(operations[operation]['second'][0], operations[operation]['second'][1]);
        return {'operation': '-', 'firstNum': first + sec, 'secondNum': sec, 'answer': first, 'statement': String(first + sec) + ' - ' + String(sec) + ' = ', 'solveTime': null, 'orderNumber' : null};
    }
    else if (operation === '*'){
        let first = randomInt(operations[operation]['first'][0], operations[operation]['first'][1]);
        let sec = randomInt(operations[operation]['second'][0], operations[operation]['second'][1]);
        return {'operation': '*', 'firstNum': first, 'secondNum': sec, 'answer': first * sec, 'statement': String(first) + ' * ' + String(sec) + ' = ', 'solveTime': null, 'orderNumber' : null};
    }

    else{
        let sec = randomInt(operations[operation]['second'][0], operations[operation]['second'][1]);
        let first = sec * randomInt(operations[operation]['first'][0], operations[operation]['first'][1]);
        return {'operation': '/', 'firstNum': first, 'secondNum': sec, 'answer': Math.floor(first / sec), 'statement': String(first) + ' / ' + String(sec) + ' = ', 'solveTime': null, 'orderNumber' : null};
    }
}



