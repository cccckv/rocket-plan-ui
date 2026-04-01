"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { authApi } from "@/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"email" | "phone">("email");
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
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
        await authApi.sendEmailOtp(formData.email, 'reset');
        setSuccess("验证码已发送，请查收邮箱（开发模式下请查看后端日志）");
      } else {
        await authApi.sendPhoneOtp(formData.phone, 'reset');
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

    if (formData.newPassword !== formData.confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("密码至少需要6位");
      return;
    }

    setLoading(true);

    try {
      if (activeTab === "email") {
        await authApi.resetPasswordWithEmail(
          formData.email,
          formData.otp,
          formData.newPassword
        );
      } else {
        await authApi.resetPasswordWithPhone(
          formData.phone,
          formData.otp,
          formData.newPassword
        );
      }
      
      setSuccess("密码重置成功，3秒后跳转到登录页面...");
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "重置密码失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              重置密码
            </h1>
            <p className="text-sm text-muted-foreground">通过邮箱或手机号重置您的密码</p>
          </div>

          <div className="rounded-2xl border border-border bg-card/50 p-8 backdrop-blur space-y-6">
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
                <TabsTrigger value="email" className="flex-1">邮箱重置</TabsTrigger>
                <TabsTrigger value="phone" className="flex-1">手机号重置</TabsTrigger>
              </TabsList>

              <TabsContent value="email">
                <form onSubmit={handleSubmit} className="space-y-4">
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
                    <label htmlFor="new-password-email" className="text-sm font-medium leading-none">
                      新密码
                    </label>
                    <Input
                      id="new-password-email"
                      type="password"
                      placeholder="至少6位"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirm-password-email" className="text-sm font-medium leading-none">
                      确认密码
                    </label>
                    <Input
                      id="confirm-password-email"
                      type="password"
                      placeholder="再次输入密码"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
                    {loading ? "重置中..." : "重置密码"}
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
                    <label htmlFor="new-password-phone" className="text-sm font-medium leading-none">
                      新密码
                    </label>
                    <Input
                      id="new-password-phone"
                      type="password"
                      placeholder="至少6位"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirm-password-phone" className="text-sm font-medium leading-none">
                      确认密码
                    </label>
                    <Input
                      id="confirm-password-phone"
                      type="password"
                      placeholder="再次输入密码"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
                    {loading ? "重置中..." : "重置密码"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            想起密码了？{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              返回登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
