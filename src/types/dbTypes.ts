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
  standard_1: string | null,
  standard_2: string | null,
  standard_3: string | null,
  standardAverage: number,
  standardTotalTests: number,
  standardPastTenTests: number[],

  rapid_1: string | null,
  rapid_2: string | null,
  rapid_3: string | null,
  rapidAverage: number,
  rapidTotalTests: number,
  rapidPastTenTests: number[],

  sprint_1: string | null,
  sprint_2: string | null,
  sprint_3: string | null,
  sprintAverage: number,
  sprintTotalTests: number,
  sprintPastTenTests: number[],

  hard_1: string | null,
  hard_2: string | null,
  hard_3: string | null,
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

