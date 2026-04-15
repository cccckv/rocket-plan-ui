"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleIcon } from "@/components/google-icon";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/lib/i18n/context";
import { authApi } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    account: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authApi.login(formData.account, formData.password);
      
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || t.auth.loginError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="flex justify-end">
            <LanguageSwitcher />
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {t.auth.welcomeBack}
            </h1>
            <p className="text-sm text-muted-foreground">{t.auth.signInSubtitle}</p>
          </div>

          <div className="rounded-2xl border border-border bg-card/50 p-8 backdrop-blur space-y-6">
            <Button
              variant="ghost"
              size="lg"
              rounded="full"
              className="w-full border border-border hover:bg-muted"
              onClick={() => {
                window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`;
              }}
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

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="account" className="text-sm font-medium leading-none">
                  {t.auth.account}
                </label>
                <Input
                  id="account"
                  type="text"
                  placeholder={t.auth.emailPlaceholder}
                  value={formData.account}
                  onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium leading-none">
                    {t.auth.password}
                  </label>
                  <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                    {t.auth.forgotPassword}
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <Button
                type="submit"
                size="lg"
                rounded="full"
                className="w-full"
                disabled={loading}
              >
                {loading ? t.auth.signingIn : t.auth.signIn}
              </Button>
            </form>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            {t.auth.noAccount}{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              {t.auth.signUp}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
