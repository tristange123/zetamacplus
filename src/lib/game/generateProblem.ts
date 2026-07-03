import {type Problem, type Operation, type OperationBounds} from '@/types/frontendTypes'

function randomInt(bottom: number, top: number){
    let seed = Math.random() * (top - bottom + 1);
    seed += bottom;
    return Math.floor(seed);

}



function chooseOperation(operations: OperationBounds): Operation{
    const mappings: Record <number, Operation>= {}
    let inc: number = 1;
    for (const operation in operations) {
        mappings[inc] = operation as Operation;
        inc += 1;
    }
    return mappings[randomInt(1, inc - 1)]
}



export function generateProblem(operations: OperationBounds): Problem{
    const operation: Operation = chooseOperation(operations);
    const operationBounds = operations[operation]!;
    if (operation === '+'){
        const first = randomInt(operationBounds['first'][0], operationBounds['first'][1]);
        const sec = randomInt(operationBounds['second'][0], operationBounds['second'][1]);
        return {'operation': '+', 'firstNum': first, 'secondNum': sec, 'answer': first + sec, 'statement': String(first) + ' + ' + String(sec) + ' = ', 'solveTime': null, 'orderNumber' : null};
    }
    else if (operation === '-'){
        const first = randomInt(operationBounds['first'][0], operationBounds['first'][1]);
        const sec = randomInt(operationBounds['second'][0], operationBounds['second'][1]);
        return {'operation': '-', 'firstNum': first + sec, 'secondNum': sec, 'answer': first, 'statement': String(first + sec) + ' - ' + String(sec) + ' = ', 'solveTime': null, 'orderNumber' : null};
    }
    else if (operation === '*'){
        const first = randomInt(operationBounds['first'][0], operationBounds['first'][1]);
        const sec = randomInt(operationBounds['second'][0], operationBounds['second'][1]);
        return {'operation': '*', 'firstNum': first, 'secondNum': sec, 'answer': first * sec, 'statement': String(first) + ' × ' + String(sec) + ' = ', 'solveTime': null, 'orderNumber' : null};
    }

    else{
        const sec = randomInt(operationBounds['second'][0], operationBounds['second'][1]);
        const first = sec * randomInt(operationBounds['first'][0], operationBounds['first'][1]);
        return {'operation': '/', 'firstNum': first, 'secondNum': sec, 'answer': Math.floor(first / sec), 'statement': String(first) + ' ÷ ' + String(sec) + ' = ', 'solveTime': null, 'orderNumber' : null};
    }
   
}




