'use client';

import Link from 'next/link';
import { usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { 
  Home, 
  Wallet, 
  PieChart, 
  Settings,
  Plus,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ReactNode;
}

export function BottomNav({ darkMode }: { darkMode: boolean }) {
  const pathname = usePathname();
  const t = useTranslations('Nav');

  const navItems: NavItem[] = [
    { href: '/', labelKey: 'home', icon: <Home className="w-5 h-5" /> },
    { href: '/accounts', labelKey: 'accounts', icon: <Wallet className="w-5 h-5" /> },
    { href: '/statistics', labelKey: 'statistics', icon: <PieChart className="w-5 h-5" /> },
    { href: '/settings', labelKey: 'settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 border-t lg:hidden ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} z-40`}>
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                isActive 
                  ? 'text-blue-500' 
                  : darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              {item.icon}
              <span className="text-xs font-medium">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function Sidebar({ darkMode }: { darkMode: boolean }) {
  const pathname = usePathname();
  const t = useTranslations('Nav');

  const navItems: NavItem[] = [
    { href: '/', labelKey: 'home', icon: <Home className="w-5 h-5" /> },
    { href: '/accounts', labelKey: 'accounts', icon: <Wallet className="w-5 h-5" /> },
    { href: '/statistics', labelKey: 'statistics', icon: <PieChart className="w-5 h-5" /> },
    { href: '/settings', labelKey: 'settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <aside className={`hidden lg:flex flex-col w-64 min-h-screen border-r ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} p-4`}>
      <div className="flex items-center gap-3 mb-8">
        <div className={`w-10 h-10 rounded-xl ${darkMode ? 'bg-blue-600' : 'bg-blue-600'} flex items-center justify-center`}>
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Money Manager
        </h1>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : darkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {item.icon}
              <span className="font-medium">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </nav>

      <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {t('totalBalance')}
        </p>
        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          CHF 2,450.00
        </p>
      </div>
    </aside>
  );
}
