import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import {
    Search,
    Filter,
    Trash2,
    Download,
    Eye,
    ChevronLeft,
    ChevronRight,
    ArrowUpRight,
    ArrowDownLeft,
    X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';

const History = () => {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const queryParam = searchParams.get('q') || '';
    const [search, setSearch] = useState(queryParam);
    const [filter, setFilter] = useState('All');
    const [viewImage, setViewImage] = useState(null);

    const categories = ['All', 'Food', 'Shopping', 'Travel', 'Bills', 'Recharge', 'Rent', 'Salary', 'Other'];

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'expenses'),
            where('userId', '==', user.uid),
            orderBy('date', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date?.toDate() || new Date()
            }));
            setExpenses(data);
            setFiltered(data);
            setLoading(false);
        }, (error) => {
            console.error("History listener error:", error);
        });

        return unsubscribe;
    }, [user]);

    useEffect(() => {
        setSearch(queryParam);
    }, [queryParam]);

    useEffect(() => {
        let result = expenses;
        if (search) {
            result = result.filter(e => e.title.toLowerCase().includes(search.toLowerCase()));
        }
        if (filter !== 'All') {
            result = result.filter(e => e.category === filter);
        }
        setFiltered(result);
    }, [search, filter, expenses]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            try {
                await deleteDoc(doc(db, 'expenses', id));
                toast.success('Transaction deleted');
            } catch (error) {
                toast.error('Failed to delete');
            }
        }
    };

    const exportCSV = () => {
        const headers = ['Date', 'Title', 'Type', 'Category', 'Amount', 'Payment Method', 'Note'];
        const rows = filtered.map(e => [
            e.date.toLocaleDateString(),
            e.title,
            e.type,
            e.category,
            e.amount,
            e.paymentMethod,
            e.note || ''
        ]);

        const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `KharchaBook_History_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Transaction History</h1>
                    <p className="text-muted font-medium mt-1">Manage and export all your financial records.</p>
                </div>
                <button
                    onClick={exportCSV}
                    className="bg-black text-white dark:bg-primary-gold dark:text-black px-6 py-3 rounded-xl flex items-center space-x-2 font-bold hover:opacity-90 transition-all self-start shadow-lg shadow-black/10"
                >
                    <Download className="h-5 w-5" />
                    <span>Export CSV</span>
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="relative flex-1 md:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
                    <input
                        type="text"
                        placeholder="Search your records..."
                        className="input-field pl-12 py-3"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="input-field pl-9 py-2 pr-8 text-sm appearance-none cursor-pointer"
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table / List View Wrapper */}
            <div className="card !p-0 overflow-hidden border-none shadow-2xl dark:shadow-black/50">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-black/40 border-b border-gray-100 dark:border-white/5">
                            <tr>
                                <th className="px-6 py-5 text-xs font-bold text-muted uppercase tracking-wider">Date</th>
                                <th className="px-6 py-5 text-xs font-bold text-muted uppercase tracking-wider">Transaction</th>
                                <th className="px-6 py-5 text-xs font-bold text-muted uppercase tracking-wider">Category</th>
                                <th className="px-6 py-5 text-xs font-bold text-muted uppercase tracking-wider">Payment</th>
                                <th className="px-6 py-5 text-xs font-bold text-muted uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-5 text-xs font-bold text-muted uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                            {filtered.map((item, idx) => (
                                <motion.tr
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={item.id}
                                    className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group"
                                >
                                    <td className="px-6 py-5 text-sm font-bold whitespace-nowrap">
                                        {item.date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-sm font-bold capitalize">{item.title}</p>
                                        {item.note && <p className="text-xs text-muted mt-0.5 max-w-[200px] truncate">{item.note}</p>}
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 dark:bg-white/5 text-muted mr-2">
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-sm font-medium text-muted uppercase">
                                        {item.paymentMethod}
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className={`flex items-center font-bold text-base ${item.type === 'income' ? 'text-green-600' : ''}`}>
                                            {item.type === 'income' ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownLeft className="h-4 w-4 mr-1" />}
                                            ₹{Number(item.amount).toLocaleString('en-IN')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right space-x-3">
                                        {item.image && (
                                            <button
                                                onClick={() => setViewImage(item.image)}
                                                className="p-2 text-primary-gold hover:bg-primary-gold/10 rounded-lg transition-colors inline-block"
                                                title="View Receipt"
                                            >
                                                <Eye className="h-5 w-5" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50/50 rounded-lg transition-all inline-block"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card List */}
                <div className="md:hidden divide-y divide-gray-100 dark:divide-white/5">
                    {filtered.map((item, idx) => (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={item.id}
                            className="p-4 space-y-3 font-sans"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-bold capitalize">{item.title}</p>
                                    <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-0.5">
                                        {item.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                                <div className={`text-right font-bold text-base ${item.type === 'income' ? 'text-green-600' : ''}`}>
                                    {item.type === 'income' ? '+' : '-'} ₹{Number(item.amount).toLocaleString('en-IN')}
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 dark:bg-white/5 text-muted">
                                    {item.category}
                                </span>
                                <div className="flex items-center space-x-2">
                                    {item.image && (
                                        <button
                                            onClick={() => setViewImage(item.image)}
                                            className="p-1.5 text-primary-gold hover:bg-primary-gold/10 rounded-lg"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50/50 rounded-lg"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Loading / Empty States */}
                {(loading || filtered.length === 0) && (
                    <div className="py-20 text-center">
                        {loading ? (
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 border-4 border-primary-gold border-t-transparent rounded-full animate-spin"></div>
                                <p className="mt-4 text-primary-grey font-medium">Crunching your transactions...</p>
                            </div>
                        ) : (
                            <div className="max-w-xs mx-auto">
                                <div className="bg-gray-100 dark:bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="h-8 w-8 text-gray-400" />
                                </div>
                                <p className="text-muted font-bold text-lg">No matches found</p>
                                <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search terms.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Image Modal */}
            <AnimatePresence>
                {viewImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
                        onClick={() => setViewImage(null)}
                    >
                        <button
                            className="absolute top-6 right-6 text-white p-3 hover:bg-white/10 rounded-full transition-colors"
                            onClick={() => setViewImage(null)}
                        >
                            <X className="h-8 w-8" />
                        </button>
                        <motion.img
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            src={viewImage}
                            className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain py-10"
                            alt="Receipt"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default History;
