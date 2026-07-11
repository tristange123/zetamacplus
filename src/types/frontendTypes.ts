export type Problem = {
    operation: string,
    firstNum: number,
    secondNum: number,
    answer: number,
    statement: string,
    solveTime: number | null,
    orderNumber: number

}

export type GameModeName = MainGameModeName | ExtraGameModeName;

export type MainGameModeName = "standard" | "rapid" | "sprint" | "hard";

export type ExtraGameModeName = "custom" | "daily" 

export type ProblemType = "easy" | "medium" | "hard" | "daily" | "easy-medium"

export type Operation = "+" | "-" | "*" | "/" 

export type OperationBounds = Partial<Record<Operation, Record<string, number[]>>>

export type GameModeType = {
    timeFormat: number,
    problemType: ProblemType
}