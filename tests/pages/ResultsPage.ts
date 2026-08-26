import { Page, Locator } from '@playwright/test';


export class ProblemTable {
    root: Locator;
    emptyState: Locator;
    rows: Locator;

    constructor(page: Page) {
        this.root = page.getByRole('table');
        this.emptyState = page.getByText('No problems solved.');
        this.rows = this.root.locator('tbody tr');
    }
}

export default class ResultsPage {
    page: Page;

    gameModeIcon: Locator;
    score: Locator;
    rankCrown: Locator;
    chart: Locator;
    restartButton: Locator;
    backButton: Locator;
    problemTable: ProblemTable;

    constructor(page: Page) {
        this.page = page;
        this.gameModeIcon = page.getByLabel(/game mode$/);
        this.score = page.getByRole('heading', { name: /^Score:/ });
        this.rankCrown = page.getByLabel(/best score$/);
        this.chart = page.locator('.recharts-responsive-container');
        this.restartButton = page.getByRole('button', { name: 'Restart' });
        this.backButton = page.getByRole('button', { name: 'Back' });
        this.problemTable = new ProblemTable(page);
    }
}
