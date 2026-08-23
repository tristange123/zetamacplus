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

    constructor(page: Page) {
        this.page = page;
        this.registerEmail = page.getByLabel('Register Email');
        this.registerPassword = page.getByLabel('Register Password');
        this.confirmPassword = page.getByLabel('Confirm Password');
        this.registerUsername = page.getByLabel('Register Username');
        this.registerButton = page.getByRole('button', { name: 'Register' });

        this.loginEmail = page.getByLabel('Email');
        this.loginPassword = page.getByLabel('Password');
        this.loginButton = page.getByRole('button', { name: 'Login' });
    }

    async goto() {
        await this.page.goto('/login');
    }

    async register(username: string, email: string, password: string, confirm: string) {
        await this.registerUsername.fill(username);
        await this.registerPassword.fill(password);
        await this.registerEmail.fill(email);
        await this.confirmPassword.fill(confirm);

        await this.registerButton.click();
    }

    async login(email: string, password: string) {
        await this.loginEmail.fill(email);
        await this.loginPassword.fill(password);

        await this.loginButton.click();
    }
}