import { Page, Locator } from '@playwright/test';


export class Profile {
    root: Locator;
    email: Locator;
    dateJoined: Locator;
    username: Locator;
    newUsernameInput: Locator;
    submitButton: Locator;
    submitMessage: Locator;

    constructor(page: Page) {
        this.root = page.getByRole('heading', { name: 'Profile' }).locator('..');
        this.email = this.root.getByText(/^Email:/);
        this.dateJoined = this.root.getByText(/^Date Joined:/);
        this.username = this.root.getByText(/^Username:/);
        this.newUsernameInput = page.getByLabel('New username');
        this.submitButton = this.root.getByRole('button', { name: 'Submit' });
        this.submitMessage = this.root.getByRole('status');
    }
}

export class UserStats {
    root: Locator;
    testsAttempted: Locator;
    testsCompleted: Locator;

    constructor(page: Page) {
        this.root = page.getByRole('heading', { name: 'User Stats', level: 3 }).locator('..');
        this.testsAttempted = this.root.getByText(/^Tests Attempted:/);
        this.testsCompleted = this.root.getByText(/^Tests Completed:/);
    }
}

export class FormatStats {
    root: Locator;
    heading: Locator;
    firstPlace: Locator;
    secondPlace: Locator;
    thirdPlace: Locator;
    averageScore: Locator;
    pastTenAverage: Locator;
    testsCompleted: Locator;

    constructor(page: Page, title: string) {
        this.heading = page.getByRole('heading', { name: title, exact: true });
        this.root = this.heading.locator('..');
        this.firstPlace = this.root.getByText('1.', { exact: true }).locator('../..');
        this.secondPlace = this.root.getByText('2.', { exact: true }).locator('../..');
        this.thirdPlace = this.root.getByText('3.', { exact: true }).locator('../..');
        this.averageScore = this.root.getByText(/^Average Score:/);
        this.pastTenAverage = this.root.getByText(/^Past 10 Average:/);
        this.testsCompleted = this.root.getByText(/^Tests Completed:/);
    }
}

export class DailyResults {
    root: Locator;
    heading: Locator;
    chart: Locator;
    emptyState: Locator;

    constructor(page: Page) {
        this.heading = page.getByRole('heading', { name: 'Daily Results' });
        this.root = this.heading.locator('../..');
        this.chart = this.root.locator('.recharts-responsive-container');
        this.emptyState = this.root.getByText('No daily runs yet.');
    }
}

export class PastRuns {
    root: Locator;
    table: Locator;
    rows: Locator;
    emptyState: Locator;
    viewProblemButtons: Locator;

    constructor(page: Page) {
        this.root = page.getByRole('heading', { name: 'Past Runs' }).locator('..');
        this.table = this.root.getByRole('table');
        this.rows = this.table.locator('tbody tr');
        this.emptyState = this.root.getByText('No runs yet.');
        this.viewProblemButtons = this.root.getByRole('button', { name: /problems for this run/ });
    }
}

export class ProblemsPanel {
    root: Locator;
    heading: Locator;
    closeButton: Locator;
    table: Locator;
    loading: Locator;
    emptyState: Locator;

    constructor(page: Page) {
        this.heading = page.getByRole('heading', { name: 'Past Run Problems' });
        this.root = this.heading.locator('xpath=ancestor::aside');
        this.closeButton = page.getByRole('button', { name: 'Close problems' });
        this.table = this.root.getByRole('table');
        this.loading = this.root.getByText('Loading problems...');
        this.emptyState = this.root.getByText('No problems found.');
    }
}

export default class StatsPage {
    page: Page;

    loginPrompt: Locator;
    verifyPrompt: Locator;
    profile: Profile;
    userStats: UserStats;
    standardStats: FormatStats;
    sprintStats: FormatStats;
    rapidStats: FormatStats;
    hardStats: FormatStats;
    dailyStats: FormatStats;
    dailyResults: DailyResults;
    pastRuns: PastRuns;
    problemsPanel: ProblemsPanel;

    constructor(page: Page) {
        this.page = page;
        this.loginPrompt = page.getByText('Log in to see stats.');
        this.verifyPrompt = page.getByText('Verify email to see stats.');
        this.profile = new Profile(page);
        this.userStats = new UserStats(page);
        this.standardStats = new FormatStats(page, 'standard');
        this.sprintStats = new FormatStats(page, 'sprint');
        this.rapidStats = new FormatStats(page, 'rapid');
        this.hardStats = new FormatStats(page, 'hard');
        this.dailyStats = new FormatStats(page, 'daily');
        this.dailyResults = new DailyResults(page);
        this.pastRuns = new PastRuns(page);
        this.problemsPanel = new ProblemsPanel(page);
    }
}
