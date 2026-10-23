export type Problem = {
    operation: string,
    firstNum: number,
    secondNum: number,
    answer: number,
    statement: string,
    solveTime: number | null,
    orderNumber: number

}

export type GameModeName = RankedGameModeName | ExtraGameModeName;

export type MainGameModeName = "standard" | "rapid" | "sprint" | "hard";

// Modes that are saved to the database and tracked in stats
export type RankedGameModeName = MainGameModeName | "daily";

// Modes that are played without saving anything
export type ExtraGameModeName = "custom" | "gcd" | "lcm"

export type ProblemType = "easy" | "medium" | "hard" | "daily" | "easy-medium"

export type Operation = "+" | "-" | "*" | "/" 

export type OperationBounds = Partial<Record<Operation, Record<string, number[]>>>

export type GameModeType = {
    timeFormat: number,
    problemType: ProblemType
}