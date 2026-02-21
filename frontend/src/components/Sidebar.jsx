import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    History,
    PieChart,
    PlusCircle,
    User,
    Settings,
    LogOut,
    X,
    Wallet,
    Target
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ThemeToggle from './ThemeToggle';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { name: 'Add Expense', icon: PlusCircle, path: '/add' },
        { name: 'History', icon: History, path: '/history' },
        { name: 'Analytics', icon: PieChart, path: '/analytics' },
        { name: 'Budgets', icon: Wallet, path: '/budgets' },
        { name: 'Savings Goals', icon: Target, path: '/goals' },
        { name: 'Profile', icon: User, path: '/profile' },
        { name: 'Settings', icon: Settings, path: '/settings' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 lg:hidden z-40 transition-opacity"
                    onClick={toggleSidebar}
                />
            )}

            <aside className={twMerge(
                "fixed inset-y-0 left-0 w-72 bg-background text-foreground z-50 transform transition-all duration-300 border-r border-gray-100 dark:border-white/5",
                "lg:static lg:translate-x-0 lg:block",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex flex-col h-full">
                    {/* Logo Section */}
                    <div className="p-8 flex items-center justify-between">
                        <h2 className="text-2xl font-bold tracking-tight">
                            Kharcha<span className="text-primary-gold">Book</span>
                        </h2>
                        <div className="flex items-center space-x-2">
                            <ThemeToggle />
                            <button onClick={toggleSidebar} className="lg:hidden text-muted">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 space-y-2 overflow-y-auto mt-4">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}
                                className={({ isActive }) => clsx(
                                    "flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all font-medium",
                                    isActive
                                        ? "bg-primary-gold text-white dark:text-black shadow-lg shadow-primary-gold/20 scale-[1.02]"
                                        : "text-muted hover:bg-gray-100 dark:hover:bg-white/5 hover:text-black dark:hover:text-white"
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                <span>{item.name}</span>
                            </NavLink>
                        ))}
                    </nav>

                    {/* Logout Section */}
                    <div className="p-6 border-t border-gray-100 dark:border-white/10">
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 px-4 py-3.5 w-full text-muted hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all font-medium"
                        >
                            <LogOut className="h-5 w-5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
