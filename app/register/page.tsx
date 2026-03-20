"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleIcon } from "@/components/google-icon";

export default function RegisterPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {t.auth.createAccount}
            </h1>
            <p className="text-sm text-muted-foreground">{t.auth.signUpSubtitle}</p>
          </div>

        <div className="rounded-2xl border border-border bg-card/50 p-8 backdrop-blur space-y-6">
          <Button
            variant="ghost"
            size="lg"
            rounded="full"
            className="w-full border border-border hover:bg-muted"
            onClick={() => console.log("Google sign up")}
          >
            <GoogleIcon className="h-5 w-5" />
            {t.auth.continueWithGoogle}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">{t.auth.orContinueWith}</span>
            </div>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium leading-none">
                {t.auth.name}
              </label>
              <Input id="name" type="text" placeholder="John Doe" />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none">
                {t.auth.email}
              </label>
              <Input id="email" type="email" placeholder="you@example.com" />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium leading-none">
                {t.auth.password}
              </label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>

            <Button size="lg" rounded="full" className="w-full">
              {t.auth.signUp}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {t.auth.hasAccount}{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            {t.auth.signIn}
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
}
