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
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { getUserProfile, logout, type UserProfile } from '@/lib/api/auth';
import { useI18n } from '@/lib/i18n/context';

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: string;
  badgeColor?: 'orange' | 'green' | 'gray';
  href?: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    icon: Home,
    label: '首页',
    href: '/dashboard',
  },
  {
    icon: BarChart3,
    label: '视频分析',
    href: '/dashboard/analytics',
  },
];

const createItems: NavItem[] = [
  {
    icon: Video,
    label: '视频',
    badge: 'Sora 2',
    badgeColor: 'orange',
    children: [
      {
        icon: Store,
        label: '灵感广场',
        href: '/dashboard/videos/inspiration',
      },
      {
        icon: Sparkles,
        label: 'Sora 生成',
        badge: '标准可用',
        badgeColor: 'green',
        href: '/dashboard/videos/generate',
      },
      {
        icon: FileText,
        label: '提示词模型',
        href: '/dashboard/videos/prompts',
      },
    ],
  },
  {
    icon: ImageIcon,
    label: '图片',
    badge: '2',
    badgeColor: 'gray',
    href: '/dashboard/images',
  },
  {
    icon: Sparkles,
    label: '一键同款',
    badge: 'New',
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
  const [isOpen, setIsOpen] = useState(level === 0);
  const hasChildren = item.children && item.children.length > 0;
  const Icon = item.icon;

  const isChildActive = hasChildren && item.children?.some(child => pathname === child.href);
  const shouldHighlight = isActive || isChildActive;

  const content = (
    <>
      <Icon className="w-5 h-5 shrink-0" />
      <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
      {item.badge && <Badge color={item.badgeColor}>{item.badge}</Badge>}
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
  const { t } = useI18n();
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
          {navItems.map((item, index) => (
            <NavItemComponent 
              key={index} 
              item={item} 
              isActive={pathname === item.href} 
            />
          ))}
        </div>

        <div className="space-y-1">
          <div className="px-3 py-1 text-xs font-semibold text-muted-foreground">
            创作
          </div>
          {createItems.map((item, index) => (
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
