import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  path: string;
  icon: string;
  label: string;
  filled?: boolean;
}

const navItems: NavItem[] = [
  { path: '/feed', icon: 'home', label: 'Feed', filled: true },
  { path: '/matching', icon: 'favorite', label: 'Matching' },
  { path: '/profile', icon: 'person', label: 'Profile' },
];

export default function BottomNavigation() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 z-10 w-full max-w-md border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black bg-opacity-95 dark:bg-opacity-95 backdrop-blur-sm">
      <div className="flex h-16 justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const iconClass = isActive && item.filled ? 'fill' : '';
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-1 flex-col items-center justify-center gap-1 pt-2.5 ${
                isActive
                  ? 'text-primary'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <span className={`material-symbols-outlined ${iconClass}`}>
                {item.icon}
              </span>
              <p className="text-xs font-bold">{item.label}</p>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
