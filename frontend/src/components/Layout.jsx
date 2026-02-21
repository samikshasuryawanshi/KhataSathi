import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, Bell, Search, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Notifications from './Notifications';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [notifCount, setNotifCount] = useState(0);
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', user.uid),
            where('read', '==', false)
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setNotifCount(snapshot.size);
        });
        return unsubscribe;
    }, [user]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/history?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    return (
        <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white dark:bg-card-dark border-b border-gray-100 dark:border-white/5 flex items-center justify-between px-6 lg:px-10 shrink-0 transition-colors duration-300">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <form
                            onSubmit={handleSearch}
                            className="hidden md:flex items-center bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-xl px-4 py-2 w-64 lg:w-96 focus-within:border-primary-gold/50 transition-all shadow-sm"
                        >
                            <Search className="h-4 w-4 text-muted mr-3" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search transactions..."
                                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted"
                            />
                            {searchQuery && (
                                <button type="button" onClick={() => setSearchQuery('')}>
                                    <X className="h-3 w-3 text-muted" />
                                </button>
                            )}
                        </form>
                    </div>

                    <div className="flex items-center space-x-4 lg:space-x-6">
                        <div className="relative">
                            <button
                                onClick={() => setIsNotifOpen(!isNotifOpen)}
                                className={`relative p-2.5 rounded-xl transition-all ${isNotifOpen ? 'bg-primary-gold text-white shadow-lg shadow-primary-gold/20' : 'hover:bg-gray-100 dark:hover:bg-white/5 text-muted'}`}
                            >
                                <Bell className="h-5 w-5" />
                                {notifCount > 0 && (
                                    <span className="absolute top-2 right-2 h-4 w-4 bg-red-500 text-[10px] text-white flex items-center justify-center rounded-full border-2 border-white dark:border-card-dark font-black">
                                        {notifCount}
                                    </span>
                                )}
                            </button>
                            <AnimatePresence>
                                <Notifications isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
                            </AnimatePresence>
                        </div>
                        <div className="flex items-center space-x-3 pl-4 border-l border-gray-200 dark:border-white/10">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold leading-none">{user?.name || 'User'}</p>
                                <p className="text-[10px] text-muted mt-1 uppercase tracking-wider font-semibold">Premium Account</p>
                            </div>
                            <img
                                src={user?.profileImage || `https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=E2AF2F&color=000`}
                                alt="Profile"
                                className="h-10 w-10 rounded-xl object-cover ring-2 ring-primary-gold/20"
                            />
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
                    <div className="max-w-7xl mx-auto w-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
