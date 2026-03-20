"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n/context";
import type { Locale } from "@/lib/i18n/translations";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { locale, setLocale, t } = useI18n();

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
          </div>
        </div>
      )}
    </header>
  );
}
