"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleIcon } from "@/components/google-icon";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useI18n } from "@/lib/i18n/context";
import { authApi } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<"email" | "phone">("email");
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    otp: "",
    password: "",
  });

  const handleSendOtp = async () => {
    if (activeTab === "email" && !formData.email) {
      setError("请先输入邮箱");
      return;
    }
    
    if (activeTab === "phone" && !formData.phone) {
      setError("请先输入手机号");
      return;
    }

    setError("");
    setSuccess("");
    setOtpLoading(true);

    try {
      if (activeTab === "email") {
        await authApi.sendEmailOtp(formData.email, 'register');
        setSuccess("验证码已发送，请查收邮箱（开发模式下请查看后端日志）");
      } else {
        await authApi.sendPhoneOtp(formData.phone, 'register');
        setSuccess("验证码已发送，请查看短信（开发模式下请查看后端日志）");
      }
      setOtpSent(true);
    } catch (err: any) {
      console.error("OTP error:", err);
      const errorMessage = err.response?.data?.message || err.message || "发送验证码失败";
      setError(`发送验证码失败: ${errorMessage}`);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      let response;
      if (activeTab === "email") {
        response = await authApi.register(
          formData.name,
          formData.email,
          formData.otp,
          formData.password
        );
      } else {
        response = await authApi.registerWithPhone(
          formData.phone,
          formData.otp,
          formData.email,
          formData.password
        );
      }
      
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "注册失败");
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
              onClick={() => {
                window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
              }}
            >
              <GoogleIcon className="h-5 w-5" />
              {t.auth.registerWithGoogle}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">{t.auth.orRegisterWith}</span>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/50 text-green-500 text-sm">
                {success}
              </div>
            )}

            <Tabs value={activeTab} onValueChange={(value) => {
              setActiveTab(value as "email" | "phone");
              setOtpSent(false);
              setError("");
              setSuccess("");
            }}>
              <TabsList className="w-full">
                <TabsTrigger value="email" className="flex-1">{t.auth.emailTab}</TabsTrigger>
                <TabsTrigger value="phone" className="flex-1">{t.auth.phoneTab}</TabsTrigger>
              </TabsList>

              <TabsContent value="email">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium leading-none">
                      姓名
                    </label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="张三"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium leading-none">
                      邮箱
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="otp-email" className="text-sm font-medium leading-none">
                      邮箱验证码
                    </label>
                    <div className="flex gap-2">
                      <Input
                        id="otp-email"
                        type="text"
                        placeholder="6位验证码"
                        value={formData.otp}
                        onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                        required
                        maxLength={6}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSendOtp}
                        disabled={otpLoading || otpSent}
                        className="whitespace-nowrap"
                      >
                        {otpLoading ? "发送中..." : otpSent ? "已发送" : "发送验证码"}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password-email" className="text-sm font-medium leading-none">
                      密码
                    </label>
                    <Input
                      id="password-email"
                      type="password"
                      placeholder="至少6位"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    rounded="full"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? "注册中..." : "注册"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="phone">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium leading-none">
                      手机号
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="13800138000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="otp-phone" className="text-sm font-medium leading-none">
                      短信验证码
                    </label>
                    <div className="flex gap-2">
                      <Input
                        id="otp-phone"
                        type="text"
                        placeholder="6位验证码"
                        value={formData.otp}
                        onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                        required
                        maxLength={6}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSendOtp}
                        disabled={otpLoading || otpSent}
                        className="whitespace-nowrap"
                      >
                        {otpLoading ? "发送中..." : otpSent ? "已发送" : "发送验证码"}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email-optional" className="text-sm font-medium leading-none">
                      邮箱（可选）
                    </label>
                    <Input
                      id="email-optional"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password-phone" className="text-sm font-medium leading-none">
                      密码（可选）
                    </label>
                    <Input
                      id="password-phone"
                      type="password"
                      placeholder="至少6位"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      minLength={6}
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    rounded="full"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? "注册中..." : "注册"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            {t.auth.hasAccount}{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              {t.auth.loginNow}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
