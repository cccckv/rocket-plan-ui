'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  BarChart3,
  Video,
  Image as ImageIcon,
  Sparkles,
  Store,
  FileText,
  ChevronRight,
  ChevronDown,
  Menu,
  LogOut,
  Settings,
  Languages,
  Check,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { getUserProfile, logout, type UserProfile } from '@/lib/api/auth';
import { useI18n } from '@/lib/i18n/context';
import type { Locale } from '@/lib/i18n/translations';

const LOCALE_OPTIONS: { value: Locale; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
];

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
  badge?: string;
  badgeKey?: string;
  badgeColor?: 'orange' | 'green' | 'gray';
  href?: string;
  children?: NavItem[];
}

const navItemsConfig: NavItem[] = [
  {
    icon: Home,
    labelKey: 'dashboard.home',
    href: '/dashboard',
  },
  {
    icon: BarChart3,
    labelKey: 'dashboard.analytics',
    href: '/dashboard/analytics',
  },
];

const createItemsConfig: NavItem[] = [
  {
    icon: Video,
    labelKey: 'dashboard.videos',
    badge: 'Sora 2',
    badgeColor: 'orange',
    children: [
      {
        icon: Store,
        labelKey: 'dashboard.inspiration',
        href: '/dashboard/videos/inspiration',
      },
      {
        icon: Sparkles,
        labelKey: 'dashboard.generate',
        badgeKey: 'dashboard.availableStandard',
        badgeColor: 'green',
        href: '/dashboard/videos/generate',
      },
      {
        icon: FileText,
        labelKey: 'dashboard.prompts',
        href: '/dashboard/videos/prompts',
      },
    ],
  },
  {
    icon: ImageIcon,
    labelKey: 'dashboard.images',
    badge: '2',
    badgeColor: 'gray',
    href: '/dashboard/images',
  },
  {
    icon: Sparkles,
    labelKey: 'dashboard.clone',
    badgeKey: 'dashboard.new',
    badgeColor: 'orange',
    href: '/dashboard/clone',
  },
];



interface BadgeProps {
  children: React.ReactNode;
  color?: 'orange' | 'green' | 'gray';
}

function Badge({ children, color = 'gray' }: BadgeProps) {
  const colorClasses = {
    orange: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
    green: 'bg-brand-green/10 text-brand-green border-brand-green/20',
    gray: 'bg-muted text-muted-foreground border-border',
  };

  return (
    <span
      className={cn(
        'px-1.5 py-0.5 text-xs rounded border',
        colorClasses[color]
      )}
    >
      {children}
    </span>
  );
}

interface NavItemComponentProps {
  item: NavItem;
  isActive?: boolean;
  level?: number;
}

function NavItemComponent({ item, isActive = false, level = 0 }: NavItemComponentProps) {
  const pathname = usePathname();
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(level === 0);
  const hasChildren = item.children && item.children.length > 0;
  const Icon = item.icon;

  const isChildActive = hasChildren && item.children?.some(child => pathname === child.href);
  const shouldHighlight = isActive || isChildActive;

  const getTranslation = (key: string) => {
    const parts = key.split('.');
    let value: any = t;
    for (const part of parts) {
      value = value?.[part];
    }
    return value || key;
  };

  const content = (
    <>
      <Icon className="w-5 h-5 shrink-0" />
      <span className="flex-1 text-left text-sm font-medium">{getTranslation(item.labelKey)}</span>
      {(item.badge || item.badgeKey) && (
        <Badge color={item.badgeColor}>
          {item.badgeKey ? getTranslation(item.badgeKey) : item.badge}
        </Badge>
      )}
      {hasChildren && (
        isOpen ? (
          <ChevronDown className="w-4 h-4 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 shrink-0" />
        )
      )}
    </>
  );

  const className = cn(
    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
    'hover:bg-sidebar-hover',
    shouldHighlight && 'bg-sidebar-active',
    level > 0 && 'pl-6'
  );

  return (
    <div>
      {item.href && !hasChildren ? (
        <Link href={item.href} className={className}>
          {content}
        </Link>
      ) : (
        <button
          onClick={() => hasChildren && setIsOpen(!isOpen)}
          className={className}
        >
          {content}
        </button>
      )}
      {hasChildren && isOpen && (
        <div className="mt-1 space-y-1">
          {item.children!.map((child, index) => (
            <NavItemComponent
              key={index}
              item={child}
              level={level + 1}
              isActive={pathname === child.href}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, locale, setLocale } = useI18n();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const profile = await getUserProfile();
        setUser(profile);
      } catch (error) {
        console.error('Failed to load user profile:', error);
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('token');
      }
      router.push('/');
    }
  };

  const getUserInitials = (user: UserProfile | null) => {
    if (!user) return '?';
    if (user.name) {
      const parts = user.name.split(' ');
      return parts.length > 1
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        : user.name.slice(0, 2).toUpperCase();
    }
    return user.email.slice(0, 2).toUpperCase();
  };

  return (
    <aside className={cn('w-72 bg-sidebar-bg flex flex-col', className)}>
      <div className="p-6 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 flex-1 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-brand-orange flex items-center justify-center font-bold text-lg">
            ct
          </div>
          <span className="font-semibold">
            <span className="text-brand-orange">CreatOK</span>
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 space-y-6">
        <div className="space-y-1">
          {navItemsConfig.map((item, index) => (
            <NavItemComponent 
              key={index} 
              item={item} 
              isActive={pathname === item.href} 
            />
          ))}
        </div>

        <div className="space-y-1">
          <div className="px-3 py-1 text-xs font-semibold text-muted-foreground">
            {t.dashboard.create}
          </div>
          {createItemsConfig.map((item, index) => (
            <NavItemComponent 
              key={index} 
              item={item}
              isActive={pathname === item.href}
            />
          ))}
        </div>


      </div>

      <div className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-sidebar-hover transition-colors">
              <div className="w-8 h-8 rounded-full bg-brand-orange flex items-center justify-center text-sm font-medium">
                {getUserInitials(user)}
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <div className="text-sm font-semibold truncate">
                  {user?.name || user?.email || 'Loading...'}
                </div>
                {user?.name && (
                  <div className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </div>
                )}
              </div>
              <ChevronDown className="w-4 h-4 shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {user && (
              <>
                <DropdownMenuItem disabled className="text-xs text-muted-foreground flex-col items-start">
                  <div className="font-medium text-foreground">{user.name || user.email}</div>
                  {user.name && <div className="text-xs">{user.email}</div>}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
              <Settings className="h-4 w-4 mr-2" />
              {t.nav.settings}
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Languages className="h-4 w-4 mr-2" />
                {t.nav.language}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {LOCALE_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setLocale(option.value)}
                  >
                    <Check
                      className={cn(
                        'h-4 w-4 mr-2',
                        locale === option.value ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
              <LogOut className="h-4 w-4 mr-2" />
              {t.nav.logout}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
