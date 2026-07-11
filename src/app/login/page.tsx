'use client';

import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth/auth-client'
import { useState } from "react";

async function createProfile(){
    return await fetch('/api/profile', {
        method: 'POST',
        headers: { "Content-Type": 'application/json'},
    });
}

function Login() {
    const [loginEmail, setLoginEmail] = useState<string>('');
    const [loginPassword, setLoginPassword] = useState<string>('');
    const [loginError, setLoginError] = useState<string>('');

    const router = useRouter();

    async function processLogin(email: string, password: string) {
        await authClient.signIn.email({
                email,
                password,
                callbackURL: "/"
        },{
            onSuccess: () => {
                router.back();
            },
            onError: (ctx) => {
                // display the error message
                setLoginError(ctx.error.message);
            }
        });
    }

    async function googleSignIn(){
        await authClient.signIn.social({
            provider: "google",
            callbackURL: "/",
        },
        {
            onSuccess: async () => {
                router.push("/");
            },
            onError: (ctx) => {
                setLoginError(ctx.error.message);
                console.log(ctx.error.message)
            }
        });
        
    }

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-gray-800">Login</h2>
            <div className="space-y-3">
                <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">Email</label>
                    <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-300"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">Password</label>
                    <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-300"
                    />
                </div>
                <p className="text-xs text-red-600">{loginError}</p>
                <button
                    onClick={() => processLogin(loginEmail, loginPassword)}
                    className="w-full rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-gray-100 transition hover:bg-gray-900"
                >
                    Login
                </button>
                <div className="flex items-center gap-3 py-1">
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-400">or</span>
                    <div className="h-px flex-1 bg-gray-200" />
                </div>
                <button
                    type="button"
                    onClick={() => googleSignIn()}
                    className="flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
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
                    Continue with Google
                </button>
                
            </div>
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
                            router.back();
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

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-gray-800">Register</h2>
            <div className="space-y-3">
                <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">Username</label>
                    <input
                        type="username"
                        value={registerUsername}
                        onChange={(e) => setRegisterUsername(e.target.value)}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-300"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">Email</label>
                    <input
                        type="email"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-300"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">Password</label>
                    <input
                        type="password"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-300"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">Confirm Password</label>
                    <input
                        type="password"
                        value={registerPasswordConfirm}
                        onChange={(e) => setRegisterPasswordConfirm(e.target.value)}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-300"
                    />
                </div>
                <p className="text-xs text-red-600">{registerError}</p>
                <button
                    onClick={() => processRegister(registerEmail, registerPassword, registerUsername, registerPasswordConfirm)}
                    className="w-full rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-gray-100 transition hover:bg-gray-900"
                >
                    Register
                </button>
            </div>
        </div>
    );
}

export default function LoginPage() {
  const {data:session} = authClient.useSession();

  if (session) {
    return (
      <section className="flex min-h-[calc(100vh-9rem)] items-center justify-center">
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 text-center shadow-sm">
          <p className="text-sm text-gray-700">Already logged in.</p>
        </div>
      </section>
    );
  }
  return (
    <section className="flex min-h-[calc(100vh-9rem)] items-center justify-center">
      <div className="w-full max-w-3xl rounded-2xl border border-gray-200 bg-gray-50/70 p-5 shadow-sm md:p-7">
        <div className="grid grid-cols-1 gap-20 md:grid-cols-2">
          <Register />
          <Login />
        </div>
      </div>
    </section>
  );
}