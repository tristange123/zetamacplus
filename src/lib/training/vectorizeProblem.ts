import {type Problem} from "../../types/frontendTypes"

/*
Vector structure:
0-3: Operation

Addition:
4: first carry
5: second carry
6: 10 units
7: answer


Subtraction:
8: first larger than 100
9: units carry
10: 10 units
11: answer

Multiplcation:
12: times 11
13: times 12
14: times 9
15: times 5 or 10
16: firstNum
17: secondNum
18: answer

Division:
19: 5 or 10
20: firstNum
21: secondNum
22: answer


*/
function standardizeUniform(x: number, lower: number, upper: number, integer: boolean = true) {
  const mean = (lower + upper) / 2;
  const n = upper - lower + 1;
  const variance = integer ? (n * n - 1) / 12 : ((upper - lower) ** 2) / 12;
  return (x - mean) / Math.sqrt(variance);
}

export default function generateVector(problem: Problem): number[] {
    const firstNum = problem.firstNum
    const secondNum = problem.secondNum
    const operation = problem.operation


    const vector = new Array(23).fill(0)

    if (operation == "+"){
        vector[0] = 1
    }
    else if (operation == "-"){
        vector[1] = 1
    }
    else if(operation == "*"){
        vector[2] = 1
    }
    else{
        vector[3] = 1
    }

    if (operation == "+"){
        if (firstNum % 10 + secondNum % 10){
            vector[4] = 1
        }
        if (firstNum + secondNum > 100){
            vector[5] = 1
        }
        if ((firstNum + secondNum) % 10 == 0){
            vector[6] = 1
        }
        vector[7] = standardizeUniform(firstNum + secondNum, 2, 200)
    }

    else if (operation == "-"){
        if (firstNum > 100){
            vector[8] = 1
        }
        if(firstNum % 10 < secondNum % 10){
            vector[9] = 1
        }
        if (firstNum % 10 == secondNum % 10){
            vector[10] = 1
        }
        vector[11] = standardizeUniform(firstNum - secondNum, 2, 100)

    }

    else if (operation == "*"){
        if (secondNum == 11){
            vector[12] = 1
        }
        if (secondNum == 12){
            vector[13] = 1
        }
        if(secondNum == 9){
            vector[14] = 1
        }
        if(secondNum == 5 || secondNum == 10){
            vector[15] = 1
        }
        
        vector[16] = standardizeUniform(firstNum, 2, 100)
        vector[17] = standardizeUniform(secondNum, 2, 12)
        vector[18] = standardizeUniform(firstNum * secondNum, 2, 1200)
    }

    else if (operation == "/"){
        if (secondNum == 5 || secondNum == 10){
            vector[19] = 1
        }
        vector[20] =  standardizeUniform(firstNum, 2, 1200)
        vector[21] =  standardizeUniform(secondNum, 2, 12)
        vector[22] =  standardizeUniform(firstNum / secondNum, 2, 100)
    }

    return vector
}

