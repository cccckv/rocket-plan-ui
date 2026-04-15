'use client';

import { DashboardLayout } from '@/components/dashboard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useI18n } from '@/lib/i18n/context';
import { User, Mail, Phone, CreditCard, Edit2, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getUserProfile, type UserProfile } from '@/lib/api/auth';
import { authApi } from '@/lib/api';

export default function SettingsPage() {
  const { t } = useI18n();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  const [bindingEmail, setBindingEmail] = useState(false);
  const [emailForm, setEmailForm] = useState({ email: '', otp: '' });
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpLoading, setEmailOtpLoading] = useState(false);

  const [bindingPhone, setBindingPhone] = useState(false);
  const [phoneForm, setPhoneForm] = useState({ phone: '', otp: '' });
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtpLoading, setPhoneOtpLoading] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const profile = await getUserProfile();
      setUser(profile);
      setNewName(profile.name || '');
    } catch (err) {
      console.error('Failed to load user profile:', err);
    }
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) {
      setError('姓名不能为空');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await authApi.updateProfile(newName);
      setSuccess('姓名更新成功');
      setEditingName(false);
      await loadUser();
    } catch (err: any) {
      setError(err.response?.data?.message || '更新失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmailOtp = async () => {
    if (!emailForm.email) {
      setError('请输入邮箱');
      return;
    }

    setEmailOtpLoading(true);
    setError('');
    setSuccess('');

    try {
      await authApi.sendEmailOtp(emailForm.email, 'register');
      setSuccess('验证码已发送到邮箱');
      setEmailOtpSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || '发送失败');
    } finally {
      setEmailOtpLoading(false);
    }
  };

  const handleBindEmail = async () => {
    if (!emailForm.email || !emailForm.otp) {
      setError('请填写邮箱和验证码');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await authApi.bindEmail(emailForm.email, emailForm.otp);
      setSuccess('邮箱绑定成功');
      setBindingEmail(false);
      setEmailForm({ email: '', otp: '' });
      setEmailOtpSent(false);
      await loadUser();
    } catch (err: any) {
      setError(err.response?.data?.message || '绑定失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSendPhoneOtp = async () => {
    if (!phoneForm.phone) {
      setError('请输入手机号');
      return;
    }

    setPhoneOtpLoading(true);
    setError('');
    setSuccess('');

    try {
      await authApi.sendPhoneOtp(phoneForm.phone, 'register');
      setSuccess('验证码已发送到手机');
      setPhoneOtpSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || '发送失败');
    } finally {
      setPhoneOtpLoading(false);
    }
  };

  const handleBindPhone = async () => {
    if (!phoneForm.phone || !phoneForm.otp) {
      setError('请填写手机号和验证码');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await authApi.bindPhone(phoneForm.phone, phoneForm.otp);
      setSuccess('手机号绑定成功');
      setBindingPhone(false);
      setPhoneForm({ phone: '', otp: '' });
      setPhoneOtpSent(false);
      await loadUser();
    } catch (err: any) {
      setError(err.response?.data?.message || '绑定失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout credits={user?.credits || 0}>
      <div className="flex flex-col h-full overflow-y-auto">
        <div className="w-full mx-auto px-4 py-8" style={{ maxWidth: '800px' }}>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold">{t.nav.settings}</h1>
            <LanguageSwitcher />
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/50 text-green-500 text-sm">
              {success}
            </div>
          )}

          <Card className="p-6 mb-4 bg-card/50 border-border">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-medium">个人信息</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">姓名</span>
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="h-8 w-40"
                      placeholder="输入姓名"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleUpdateName}
                      disabled={loading}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingName(false);
                        setNewName(user?.name || '');
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{user?.name || '-'}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingName(true)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="py-2 border-b border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">邮箱</span>
                  {!user?.email && !bindingEmail && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setBindingEmail(true)}
                    >
                      绑定邮箱
                    </Button>
                  )}
                </div>
                {user?.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <span>{user.email}</span>
                    {user.emailVerified && (
                      <span className="px-2 py-0.5 rounded text-xs bg-green-500/10 text-green-500">
                        已验证
                      </span>
                    )}
                  </div>
                )}
                {bindingEmail && (
                  <div className="mt-2 space-y-2">
                    <Input
                      type="email"
                      placeholder="输入邮箱"
                      value={emailForm.email}
                      onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <Input
                        placeholder="6位验证码"
                        maxLength={6}
                        value={emailForm.otp}
                        onChange={(e) => setEmailForm({ ...emailForm, otp: e.target.value })}
                      />
                      <Button
                        variant="outline"
                        onClick={handleSendEmailOtp}
                        disabled={emailOtpLoading || emailOtpSent}
                        className="whitespace-nowrap"
                      >
                        {emailOtpLoading ? '发送中...' : emailOtpSent ? '已发送' : '发送验证码'}
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleBindEmail} disabled={loading} className="flex-1">
                        {loading ? '绑定中...' : '确认绑定'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setBindingEmail(false);
                          setEmailForm({ email: '', otp: '' });
                          setEmailOtpSent(false);
                        }}
                      >
                        取消
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="py-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">手机号</span>
                  {!user?.phone && !bindingPhone && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setBindingPhone(true)}
                    >
                      绑定手机
                    </Button>
                  )}
                </div>
                {user?.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <span>{user.phone}</span>
                    {user.phoneVerified && (
                      <span className="px-2 py-0.5 rounded text-xs bg-green-500/10 text-green-500">
                        已验证
                      </span>
                    )}
                  </div>
                )}
                {bindingPhone && (
                  <div className="mt-2 space-y-2">
                    <Input
                      type="tel"
                      placeholder="输入手机号"
                      value={phoneForm.phone}
                      onChange={(e) => setPhoneForm({ ...phoneForm, phone: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <Input
                        placeholder="6位验证码"
                        maxLength={6}
                        value={phoneForm.otp}
                        onChange={(e) => setPhoneForm({ ...phoneForm, otp: e.target.value })}
                      />
                      <Button
                        variant="outline"
                        onClick={handleSendPhoneOtp}
                        disabled={phoneOtpLoading || phoneOtpSent}
                        className="whitespace-nowrap"
                      >
                        {phoneOtpLoading ? '发送中...' : phoneOtpSent ? '已发送' : '发送验证码'}
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleBindPhone} disabled={loading} className="flex-1">
                        {loading ? '绑定中...' : '确认绑定'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setBindingPhone(false);
                          setPhoneForm({ phone: '', otp: '' });
                          setPhoneOtpSent(false);
                        }}
                      >
                        取消
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6 mb-4 bg-card/50 border-border">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-medium">积分充值</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">当前积分</span>
                <span className="text-lg font-semibold text-primary">{user?.credits || 0}</span>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <p className="text-sm text-muted-foreground mb-3">
                  积分充值功能开发中，敬请期待...
                </p>
                <Button disabled className="w-full">
                  充值积分
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
