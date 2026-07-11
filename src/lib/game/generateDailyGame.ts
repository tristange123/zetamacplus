import {type Problem} from '@/types/frontendTypes'
import {generateProblem} from './generateProblem'
import {BOUNDS} from './gameModeGlobals'


export function generateDailyGame(): Problem[]{
    const problemList: Problem[] = [];
    for (let i = 0; i < 10000; i++){
        let problem: Problem = generateProblem(BOUNDS['daily'], i+1);
        problem.orderNumber = i;
        problemList.push(problem);
    }

    return problemList;
}
