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



export function generateProblem(operations: OperationBounds, orderNumber: number): Problem{
    const operation: Operation = chooseOperation(operations);
    const operationBounds = operations[operation]!;
    if (operation === '+'){
        const first = randomInt(operationBounds['first'][0], operationBounds['first'][1]);
        const sec = randomInt(operationBounds['second'][0], operationBounds['second'][1]);
        return {'operation': '+', 'firstNum': first, 'secondNum': sec, 'answer': first + sec, 'statement': String(first) + ' + ' + String(sec) + ' = ', 'solveTime': null, orderNumber};
    }
    else if (operation === '-'){
        const first = randomInt(operationBounds['first'][0], operationBounds['first'][1]);
        const sec = randomInt(operationBounds['second'][0], operationBounds['second'][1]);
        return {'operation': '-', 'firstNum': first + sec, 'secondNum': sec, 'answer': first, 'statement': String(first + sec) + ' - ' + String(sec) + ' = ', 'solveTime': null, orderNumber};
    }
    else if (operation === '*'){
        const first = randomInt(operationBounds['first'][0], operationBounds['first'][1]);
        const sec = randomInt(operationBounds['second'][0], operationBounds['second'][1]);
        return {'operation': '*', 'firstNum': first, 'secondNum': sec, 'answer': first * sec, 'statement': String(first) + ' × ' + String(sec) + ' = ', 'solveTime': null, orderNumber};
    }

    else{
        const sec = randomInt(operationBounds['second'][0], operationBounds['second'][1]);
        const first = sec * randomInt(operationBounds['first'][0], operationBounds['first'][1]);
        return {'operation': '/', 'firstNum': first, 'secondNum': sec, 'answer': Math.floor(first / sec), 'statement': String(first) + ' ÷ ' + String(sec) + ' = ', 'solveTime': null, orderNumber};
    }  
}

export function generateGame(operations: OperationBounds): Problem[]{
    const problemList: Problem[] = [];
    for (let i = 0; i < 10000; i++){
        let problem: Problem = generateProblem(operations, i+1);
        problem.orderNumber = i;
        problemList.push(problem);
    }
    return problemList;
}

function gcd(a: number, b: number): number {
    return b === 0 ? a : gcd(b, a % b);
}

function randomDistinctPair(bottom: number, top: number): [number, number] {
    const first = randomInt(bottom, top);
    let second = randomInt(bottom, top);
    while (second === first) {
        second = randomInt(bottom, top);
    }
    return [first, second];
}

export function generateGcdProblem(orderNumber: number): Problem {
    // Share a factor so the answer is usually bigger than 1
    const factor = randomInt(2, 12);
    const [firstMultiple, secondMultiple] = randomDistinctPair(1, 12);
    const first = factor * firstMultiple;
    const sec = factor * secondMultiple;
    return {'operation': 'gcd', 'firstNum': first, 'secondNum': sec, 'answer': gcd(first, sec), 'statement': `gcd(${first}, ${sec}) = `, 'solveTime': null, orderNumber};
}

export function generateLcmProblem(orderNumber: number): Problem {
    const [first, sec] = randomDistinctPair(2, 15);
    return {'operation': 'lcm', 'firstNum': first, 'secondNum': sec, 'answer': first * sec / gcd(first, sec), 'statement': `lcm(${first}, ${sec}) = `, 'solveTime': null, orderNumber};
}

export type ProblemSource = (orderNumber: number) => Problem;

// Serializable description of where a game's problems come from,
// so server pages can pass it to client game components
export type ProblemConfig =
    | {kind: 'operations', operations: OperationBounds}
    | {kind: 'fixed', problems: Problem[]}
    | {kind: 'gcd'}
    | {kind: 'lcm'};

export function createProblemSource(config: ProblemConfig): ProblemSource {
    switch (config.kind) {
        case 'operations':
            return (orderNumber) => generateProblem(config.operations, orderNumber);
        case 'fixed':
            return (orderNumber) => ({...config.problems[orderNumber % config.problems.length], orderNumber});
        case 'gcd':
            return generateGcdProblem;
        case 'lcm':
            return generateLcmProblem;
    }
}
