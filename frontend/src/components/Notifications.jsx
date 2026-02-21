import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Trash2, CheckCircle, AlertTriangle, Zap } from 'lucide-react';

const Notifications = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(10)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, (error) => {
            console.error("Notifications listener error:", error);
        });

        return unsubscribe;
    }, [user]);

    const markAsRead = async (id) => {
        try {
            await updateDoc(doc(db, 'notifications', id), { read: true });
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await deleteDoc(doc(db, 'notifications', id));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-40" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-card-dark rounded-2xl shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden z-50"
            >
                <div className="p-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <h3 className="font-bold text-lg">Notifications</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg">
                        <X className="h-4 w-4 text-muted" />
                    </button>
                </div>

                <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-100 dark:divide-white/5">
                    {notifications.length > 0 ? notifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={`p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors relative group ${!notif.read ? 'bg-primary-gold/5 border-l-4 border-primary-gold' : ''}`}
                        >
                            <div className="flex items-start space-x-3">
                                <div className={`p-2 rounded-xl shrink-0 ${notif.type === 'alert' ? 'bg-red-100 text-red-600' :
                                    notif.type === 'goal' ? 'bg-green-100 text-green-600' :
                                        'bg-primary-gold/10 text-primary-gold'
                                    }`}>
                                    {notif.type === 'alert' ? <AlertTriangle className="h-4 w-4" /> :
                                        notif.type === 'goal' ? <CheckCircle className="h-4 w-4" /> :
                                            <Zap className="h-4 w-4" />}
                                </div>
                                <div className="flex-1 pr-6">
                                    <p className="text-sm font-bold leading-tight">{notif.title}</p>
                                    <p className="text-xs text-muted mt-1 font-medium">{notif.message}</p>
                                    <p className="text-[10px] text-muted mt-2 uppercase font-bold tracking-widest">
                                        {notif.createdAt?.toDate().toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>

                            <div className="absolute top-4 right-4 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!notif.read && (
                                    <button onClick={() => markAsRead(notif.id)} className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-primary-gold hover:scale-110 transition-transform">
                                        <CheckCircle className="h-3.5 w-3.5" />
                                    </button>
                                )}
                                <button onClick={() => deleteNotification(notif.id)} className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-red-500 hover:scale-110 transition-transform">
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="py-12 text-center opacity-40">
                            <Bell className="h-10 w-10 mx-auto mb-3 text-muted" />
                            <p className="text-sm font-medium italic">All caught up!</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </>
    );
};

export default Notifications;
