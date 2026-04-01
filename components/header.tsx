"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, Languages, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/lib/i18n/context";
import type { Locale } from "@/lib/i18n/translations";
import { getUserProfile, logout, type UserProfile } from "@/lib/api/auth";
import { useRouter } from "next/navigation";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const { locale, setLocale, t } = useI18n();
  const router = useRouter();

  React.useEffect(() => {
    const checkAuth = async () => {
      const token = typeof window !== 'undefined' 
        ? (localStorage.getItem('accessToken') || localStorage.getItem('token'))
        : null;
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile();
        setUser(profile);
      } catch (error) {
        console.error('Failed to load user profile:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for storage changes (login/logout in other tabs)
    const handleStorageChange = () => {
      checkAuth();
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Clear local state anyway
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('token');
      }
      router.push('/');
    }
  };

  const navItems = [
    { name: t.nav.home, href: "/" },
    { name: t.nav.features, href: "#features" },
    { name: t.nav.models, href: "#models" },
    { name: t.nav.tools, href: "#tools" },
    { name: t.nav.agents, href: "/agent-skills" },
    { name: t.nav.pricing, href: "/pricing" },
    { name: t.nav.faq, href: "#faq" },
  ];

  return (
    <header className="w-full">
      <nav className="mx-auto w-full max-w-7xl flex items-center justify-between px-6 py-5">
        <div className="flex items-center">
          <Link className="flex items-center gap-2" href="/">
            <span className="text-2xl font-bold tracking-tight text-foreground">CreatOK</span>
          </Link>
        </div>

        <ul className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="px-4 py-2 rounded-md text-sm font-medium text-primary hover:bg-muted transition-colors"
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" rounded="full" className="text-sm">
                  {t.nav.dashboard}
                </Button>
              </Link>
              <Select value={locale} onValueChange={(v) => setLocale(v as Locale)}>
                <SelectTrigger className="w-[120px] border-none focus:ring-0 shadow-none">
                  <Languages className="h-4 w-4 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                  <SelectItem value="ko">한국어</SelectItem>
                </SelectContent>
              </Select>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" rounded="full" className="text-sm">
                    <User className="h-4 w-4 mr-2" />
                    {user.name || user.email}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    {t.nav.logout}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Select value={locale} onValueChange={(v) => setLocale(v as Locale)}>
                <SelectTrigger className="w-[120px] border-none focus:ring-0 shadow-none">
                  <Languages className="h-4 w-4 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                  <SelectItem value="ko">한국어</SelectItem>
                </SelectContent>
              </Select>
              {!isLoading && (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" rounded="full" className="text-sm">
                      {t.nav.login}
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" rounded="full" className="text-sm">
                      {t.nav.signup}
                    </Button>
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        <button
          aria-label="menu"
          className="text-gray-300 outline-none lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="lg:hidden px-6 pb-4">
          <ul className="flex flex-col gap-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block px-4 py-2 rounded-md text-sm font-medium text-primary hover:bg-muted transition-colors"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t flex flex-col gap-3">
            <Select value={locale} onValueChange={(v) => setLocale(v as Locale)}>
              <SelectTrigger className="w-full focus:ring-0">
                <Languages className="h-4 w-4 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
                <SelectItem value="ja">日本語</SelectItem>
                <SelectItem value="ko">한국어</SelectItem>
              </SelectContent>
            </Select>
            {user ? (
              <>
                <Link href="/dashboard" className="w-full">
                  <Button variant="ghost" size="sm" rounded="full" className="w-full text-sm">
                    {t.nav.dashboard}
                  </Button>
                </Link>
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  {user.email}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  rounded="full" 
                  className="w-full text-sm"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t.nav.logout}
                </Button>
              </>
            ) : (
              !isLoading && (
                <div className="flex gap-3">
                  <Link href="/login" className="flex-1">
                    <Button variant="ghost" size="sm" rounded="full" className="w-full text-sm">
                      {t.nav.login}
                    </Button>
                  </Link>
                  <Link href="/register" className="flex-1">
                    <Button size="sm" rounded="full" className="w-full text-sm">
                      {t.nav.signup}
                    </Button>
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
}
