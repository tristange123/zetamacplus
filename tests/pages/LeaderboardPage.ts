import { Page, Locator } from '@playwright/test';


export class GameModeNav {
    heading: Locator;
    standard: Locator;
    rapid: Locator;
    sprint: Locator;
    hard: Locator;
    daily: Locator;

    constructor(page: Page) {
        this.heading = page.getByRole('heading', { name: 'Game Modes' });
        this.standard = page.getByRole('button', { name: 'Standard' });
        this.rapid = page.getByRole('button', { name: 'Rapid' });
        this.sprint = page.getByRole('button', { name: 'Sprint' });
        this.hard = page.getByRole('button', { name: 'Hard' });
        this.daily = page.getByRole('button', { name: 'Daily' });
    }
}

export class LeaderboardTable {
    root: Locator;
    rows: Locator;
    emptyState: Locator;
    viewProblemButtons: Locator;

    constructor(page: Page) {
        this.root = page.getByRole('table').filter({ has: page.getByRole('columnheader', { name: 'Rank' }) });
        this.rows = this.root.locator('tbody tr');
        this.emptyState = this.root.getByText('No leaderboard entries yet.');
        this.viewProblemButtons = this.root.getByRole('button', { name: /problems for / });
    }
}

export class ProblemsSidebar {
    root: Locator;
    heading: Locator;
    closeButton: Locator;
    table: Locator;
    loading: Locator;
    emptyState: Locator;

    constructor(page: Page) {
        this.heading = page.getByRole('heading', { name: /Problems$/ });
        this.root = this.heading.locator('xpath=ancestor::aside');
        this.closeButton = page.getByRole('button', { name: 'Close problems' });
        this.table = this.root.getByRole('table');
        this.loading = this.root.getByText('Loading problems...');
        this.emptyState = this.root.getByText('No problems found.');
    }
}

export default class LeaderboardPage {
    page: Page;

    gameModeNav: GameModeNav;
    title: Locator;
    table: LeaderboardTable;
    problemsSidebar: ProblemsSidebar;

    constructor(page: Page) {
        this.page = page;
        this.gameModeNav = new GameModeNav(page);
        this.title = page.getByRole('heading', { level: 1 });
        this.table = new LeaderboardTable(page);
        this.problemsSidebar = new ProblemsSidebar(page);
    }
}
