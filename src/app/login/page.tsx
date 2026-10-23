'use client';

import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth/auth-client'
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight } from 'lucide-react';

async function createProfile(){
    return await fetch('/api/profile', {
        method: 'POST',
        headers: { "Content-Type": 'application/json'},
    });
}

type AuthTab = 'login' | 'register';

const INPUT_CLASS = "w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 shadow-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200";
const PRIMARY_BUTTON_CLASS = "group flex w-full items-center justify-center gap-3 rounded-md bg-gray-900 px-10 py-3 text-sm font-semibold text-white transition hover:bg-black";

function Field({id, label, children}: {id: string, label: string, children: ReactNode}) {
    return (
        <div>
            <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-gray-500">{label}</label>
            {children}
        </div>
    );
}

function SubmitButton({children}: {children: ReactNode}) {
    return (
        <button type="submit" className={PRIMARY_BUTTON_CLASS}>
            {children}
            <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </button>
    );
}

function Login() {
    const [loginEmail, setLoginEmail] = useState<string>('');
    const [loginPassword, setLoginPassword] = useState<string>('');
    const [loginError, setLoginError] = useState<string>('');
    const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
    const googleSignInStarted = useRef(false);

    const router = useRouter();

    async function processLogin(email: string, password: string) {
        await authClient.signIn.email({
                email,
                password,
                callbackURL: "/"
        },{
            onSuccess: () => {
                router.replace("/");
            },
            onError: (ctx) => {
                // display the error message
                setLoginError(ctx.error.message);
            }
        });
    }

    async function googleSignIn(){
        if (googleSignInStarted.current) {
            return;
        }

        googleSignInStarted.current = true;
        setIsGoogleSigningIn(true);
        setLoginError('');

        await authClient.signIn.social({
            provider: "google",
            callbackURL: "/",
        },
        {
            onError: (ctx) => {
                setLoginError(ctx.error.message);
                googleSignInStarted.current = false;
                setIsGoogleSigningIn(false);
                console.log(ctx.error.message)
            }
        });

    }

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        void processLogin(loginEmail, loginPassword);
    }

    return (
        <div className="space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Field id="login-email" label="Email">
                    <input
                        id="login-email"
                        type="email"
                        autoComplete="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className={INPUT_CLASS}
                    />
                </Field>
                <Field id="login-password" label="Password">
                    <input
                        id="login-password"
                        type="password"
                        autoComplete="current-password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className={INPUT_CLASS}
                    />
                </Field>
                <p className="min-h-4 text-xs text-red-600">{loginError}</p>
                <SubmitButton>Login</SubmitButton>
            </form>

            <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs text-gray-400">or</span>
                <div className="h-px flex-1 bg-gray-200" />
            </div>

            <button
                type="button"
                onClick={() => googleSignIn()}
                disabled={isGoogleSigningIn}
                className="flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                        fill="#FBBC05"
                        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                    />
                    <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z"
                    />
                </svg>
                {isGoogleSigningIn ? "Redirecting…" : "Continue with Google"}
            </button>
        </div>
    );
}

function Register() {
    const [registerEmail, setRegisterEmail] = useState<string>('');
    const [registerPassword, setRegisterPassword] = useState<string>('');
    const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState<string>('');
    const [registerUsername, setRegisterUsername] = useState<string>('');
    const [registerError, setRegisterError] = useState<string>('');

    const router = useRouter();

    async function processRegister(email: string, password: string, name: string, passwordConfirm: string) {
        if (passwordConfirm != password){
            setRegisterError("Passwords do not match");
        }
        else{
            await authClient.signUp.email({
                email, // user email address
                password,
                name,  // user password -> min 8 characters by default
                callbackURL: "/" // A URL to redirect to after the user verifies their email (optional)
            },

            {   onSuccess: async () => {
                    try {
                        const res: Response = await createProfile();
                        if (!res.ok){
                            const errText = await res.json()
                            console.log(errText);
                        }
                        else{
                            router.replace("/");
                        }
                    } catch (err) {
                        console.error(err);
                    }


                },
                onError: (ctx) => {
                    console.log(ctx.error.message);
                    setRegisterError(ctx.error.message);
                },
            }
            );

        }

    }

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        void processRegister(registerEmail, registerPassword, registerUsername, registerPasswordConfirm);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Field id="register-username" label="Username">
                <input
                    id="register-username"
                    type="text"
                    autoComplete="username"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    className={INPUT_CLASS}
                />
            </Field>
            <Field id="register-email" label="Email">
                <input
                    id="register-email"
                    type="email"
                    autoComplete="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className={INPUT_CLASS}
                />
            </Field>
            <Field id="register-password" label="Password">
                <input
                    id="register-password"
                    type="password"
                    autoComplete="new-password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className={INPUT_CLASS}
                />
            </Field>
            <Field id="register-password-confirm" label="Confirm password">
                <input
                    id="register-password-confirm"
                    type="password"
                    autoComplete="new-password"
                    value={registerPasswordConfirm}
                    onChange={(e) => setRegisterPasswordConfirm(e.target.value)}
                    className={INPUT_CLASS}
                />
            </Field>
            <p className="min-h-4 text-xs text-red-600">{registerError}</p>
            <SubmitButton>Register</SubmitButton>
        </form>
    );
}

const TABS: { id: AuthTab, label: string }[] = [
    { id: 'login', label: 'Log in' },
    { id: 'register', label: 'Register' },
];

export default function LoginPage() {
  const {data:session} = authClient.useSession();
  const [tab, setTab] = useState<AuthTab>('login');

  if (session) {
    return (
      <section className="flex min-h-[calc(100vh-9rem)] items-center justify-center">
        <p className="text-sm text-gray-500">Already logged in.</p>
      </section>
    );
  }

  return (
    <section className="flex min-h-[calc(100vh-9rem)] justify-center pt-[8vh] md:pt-[10vh]">
      <div className="w-full max-w-sm px-3">
        <div role="tablist" aria-label="Account" className="grid grid-cols-2 border-b border-gray-200">
          {TABS.map(({ id, label }) => {
            const isSelected = tab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                id={`${id}-tab`}
                aria-selected={isSelected}
                aria-controls={`${id}-panel`}
                onClick={() => setTab(id)}
                className={`relative pb-4 pt-2 text-sm font-semibold transition-colors sm:text-base ${
                  isSelected ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {label}
                {isSelected && (
                  <span className="absolute -bottom-px left-1/2 h-0.5 w-10 -translate-x-1/2 rounded-full bg-gray-800" />
                )}
              </button>
            );
          })}
        </div>

        <div role="tabpanel" id={`${tab}-panel`} aria-labelledby={`${tab}-tab`} className="pt-8">
          {tab === 'login' ? <Login /> : <Register />}
        </div>
      </div>
    </section>
  );
}
