export type ProblemDb = {
    id: string,
    testId: string,
    orderNumber: number,
    operation: string,
    firstNum: number,
    secondNum: number,
    answer: number
    gameMode: string
    statement: string
    solveTime: number 
}


export type ProfileDb = {
  userId: string,
  email: string,
  username: string,
  timeJoined: Date,
  testsAttempted: number,
  testsCompleted: number,
  standard_1: number,
  standard_2: number,
  standard_3: number,
  standardAverage: number,
  standardTotalTests: number,
  standardPastTenTests: number[],

  rapid_1: number,
  rapid_2: number,
  rapid_3: number,
  rapidAverage: number,
  rapidTotalTests: number,
  rapidPastTenTests: number[],

  sprint_1: number,
  sprint_2: number,
  sprint_3: number,
  sprintAverage: number,
  sprintTotalTests: number,
  sprintPastTenTests: number[],

  hard_1: number,
  hard_2: number,
  hard_3: number,
  hardAverage: number,
  hardTotalTests: number,
  hardPastTenTests: number[]
}

export type TestDb = {
  id: string,
  score: number,
  time: Date,
  gameMode: string,
  userId: string | null
}

