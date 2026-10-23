import { Page, Locator } from '@playwright/test';


export default class LoginPage {
    page: Page;

    registerEmail: Locator;
    registerPassword: Locator;
    confirmPassword: Locator;
    registerUsername: Locator;

    registerButton: Locator;

    loginEmail: Locator;
    loginPassword: Locator;
    loginButton: Locator;

    registerTab: Locator;
    loginTab: Locator;

    constructor(page: Page) {
        this.page = page;
        this.registerTab = page.getByRole('tab', { name: 'Register' });
        this.loginTab = page.getByRole('tab', { name: 'Log in' });

        // Only the selected tab's form is rendered, so the shared labels are unique
        this.registerEmail = page.getByLabel('Email', { exact: true });
        this.registerPassword = page.getByLabel('Password', { exact: true });
        this.confirmPassword = page.getByLabel('Confirm password');
        this.registerUsername = page.getByLabel('Username');
        this.registerButton = page.getByRole('button', { name: 'Register' });

        this.loginEmail = page.getByLabel('Email', { exact: true });
        this.loginPassword = page.getByLabel('Password', { exact: true });
        this.loginButton = page.getByRole('button', { name: 'Login' });
    }

    async goto() {
        await this.page.goto('/login');
    }

    async register(username: string, email: string, password: string, confirm: string) {
        await this.registerTab.click();
        await this.registerUsername.fill(username);
        await this.registerPassword.fill(password);
        await this.registerEmail.fill(email);
        await this.confirmPassword.fill(confirm);

        await this.registerButton.click();
    }

    async login(email: string, password: string) {
        await this.loginTab.click();
        await this.loginEmail.fill(email);
        await this.loginPassword.fill(password);

        await this.loginButton.click();
    }
}