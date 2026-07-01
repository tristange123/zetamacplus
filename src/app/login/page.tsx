'use client';

import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth/auth-client'
import { useState } from "react";


function Login() {
    const [loginEmail, setLoginEmail] = useState<string>('');
    const [loginPassword, setLoginPassword] = useState<string>('');
    const [loginError, setLoginError] = useState<string>('');

    const router = useRouter();

    async function processLogin(email: string, password: string) {
        const { data, error } = await authClient.signIn.email({
                email,
                password,
                callbackURL: "/"
        },{
            onSuccess: (ctx) => {
                router.back();
            },
            onError: (ctx) => {
                // display the error message
                setLoginError(ctx.error.message);
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
            const { data, error } = await authClient.signUp.email({
                email, // user email address
                password,
                name,  // user password -> min 8 characters by default
                callbackURL: "/" // A URL to redirect to after the user verifies their email (optional)
            }, 

            {
                onError: (ctx) => {
                    console.log(ctx.error.message);
                    setRegisterError(ctx.error.message);
                },
            }
            );
            if (data){
                async function createProfile(username: string, email: string, userId: string, timeJoined: Date){
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`, {
                        method: 'POST',
                        headers: { "Content-Type": 'application/json'},
                        body: JSON.stringify({username, email, userId, timeJoined})
                    });
                }
                createProfile(name, email, data.user.id, data.user.createdAt);
                router.back();
            }
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