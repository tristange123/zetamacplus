import { Page, Locator } from '@playwright/test';


function answerFromStatement(statement: string): number {
    const match = statement.match(/^(\d+)\s*([+\-×÷*\/])\s*(\d+)/);
    if (!match) {
        throw new Error(`Could not parse problem statement: ${statement}`);
    }

    const left = Number(match[1]);
    const right = Number(match[3]);
    const operator = match[2];

    if (operator === '+') return left + right;
    if (operator === '-') return left - right;
    if (operator === '×' || operator === '*') return left * right;
    return left / right;
}

export class OnScreenKeyboard {
    key0: Locator;
    key1: Locator;
    key2: Locator;
    key3: Locator;
    key4: Locator;
    key5: Locator;
    key6: Locator;
    key7: Locator;
    key8: Locator;
    key9: Locator;
    backspace: Locator;

    constructor(page: Page) {
        this.key0 = page.getByRole('button', { name: '0', exact: true });
        this.key1 = page.getByRole('button', { name: '1', exact: true });
        this.key2 = page.getByRole('button', { name: '2', exact: true });
        this.key3 = page.getByRole('button', { name: '3', exact: true });
        this.key4 = page.getByRole('button', { name: '4', exact: true });
        this.key5 = page.getByRole('button', { name: '5', exact: true });
        this.key6 = page.getByRole('button', { name: '6', exact: true });
        this.key7 = page.getByRole('button', { name: '7', exact: true });
        this.key8 = page.getByRole('button', { name: '8', exact: true });
        this.key9 = page.getByRole('button', { name: '9', exact: true });
        this.backspace = page.getByRole('button', { name: 'Backspace' });
    }
}

export default class GamePage {
    page: Page;

    score: Locator;
    timer: Locator;
    problem: Locator;
    answerInput: Locator;
    restartButton: Locator;
    backButton: Locator;
    keyboard: OnScreenKeyboard;

    constructor(page: Page) {
        this.page = page;
        this.score = page.getByText(/^Score:/);
        this.timer = page.getByText(/^Time:/);
        this.problem = page.getByRole('heading', { level: 2 });
        this.answerInput = page.getByLabel('Game answer');
        this.restartButton = page.getByRole('button', { name: 'Restart' });
        this.backButton = page.getByRole('button', { name: 'Back' });
        this.keyboard = new OnScreenKeyboard(page);
    }

    async solveProblem() {
        await this.problem.filter({ hasText: /\d/ }).waitFor();
        const statement = (await this.problem.textContent()) ?? '';
        const answer = answerFromStatement(statement);
        await this.answerInput.pressSequentially(String(answer));
    }
}
