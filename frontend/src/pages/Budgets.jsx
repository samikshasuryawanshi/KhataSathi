import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wallet,
    Plus,
    Trash2,
    AlertCircle,
    CheckCircle2,
    Utensils,
    ShoppingBag,
    Car,
    Zap,
    Smartphone,
    Home,
    Briefcase,
    Layers
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORY_ICONS = {
    Food: { icon: Utensils, color: 'text-orange-600', bg: 'bg-orange-100' },
    Shopping: { icon: ShoppingBag, color: 'text-pink-600', bg: 'bg-pink-100' },
    Travel: { icon: Car, color: 'text-blue-600', bg: 'bg-blue-100' },
    Bills: { icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    Recharge: { icon: Smartphone, color: 'text-purple-600', bg: 'bg-purple-100' },
    Rent: { icon: Home, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    Salary: { icon: Briefcase, color: 'text-green-600', bg: 'bg-green-100' },
    Other: { icon: Layers, color: 'text-gray-600', bg: 'bg-gray-100' },
};

const Budgets = () => {
    const { user } = useAuth();
    const [budgets, setBudgets] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newBudget, setNewBudget] = useState({ category: 'Food', amount: '' });

    useEffect(() => {
        if (!user) return;

        // Fetch Budgets
        const bq = query(collection(db, 'budgets'), where('userId', '==', user.uid));
        const unsubscribeBudgets = onSnapshot(bq, (snapshot) => {
            setBudgets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // Fetch Expenses for this month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const eq = query(
            collection(db, 'expenses'),
            where('userId', '==', user.uid),
            where('type', '==', 'expense')
        );

        const unsubscribeExpenses = onSnapshot(eq, (snapshot) => {
            const monthlyExpenses = snapshot.docs
                .map(doc => ({ ...doc.data(), date: doc.data().date?.toDate() }))
                .filter(exp => exp.date >= startOfMonth);
            setExpenses(monthlyExpenses);
            setLoading(false);
        });

        return () => {
            unsubscribeBudgets();
            unsubscribeExpenses();
        };
    }, [user]);

    const handleSaveBudget = async (e) => {
        e.preventDefault();
        try {
            const budgetId = `${user.uid}_${newBudget.category}`;
            await setDoc(doc(db, 'budgets', budgetId), {
                userId: user.uid,
                category: newBudget.category,
                amount: Number(newBudget.amount),
                updatedAt: new Date()
            });
            toast.success('Budget updated!');
            setShowModal(false);
            setNewBudget({ category: 'Food', amount: '' });
        } catch (error) {
            toast.error('Failed to save budget');
        }
    };

    const handleDeleteBudget = async (id) => {
        try {
            await deleteDoc(doc(db, 'budgets', id));
            toast.success('Budget removed');
        } catch (error) {
            toast.error('Failed to delete budget');
        }
    };

    const getSpentAmount = (category) => {
        return expenses
            .filter(exp => exp.category === category)
            .reduce((acc, curr) => acc + Number(curr.amount), 0);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Monthly Budgets</h1>
                    <p className="text-muted font-medium mt-1">Plan your spending and save more.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-yellow flex items-center space-x-2 py-3 px-6 shadow-xl shadow-primary-gold/20 self-start"
                >
                    <Plus className="h-5 w-5" />
                    <span>Set New Budget</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {budgets.map((budget) => {
                    const spent = getSpentAmount(budget.category);
                    const percentage = Math.min((spent / budget.amount) * 100, 100);
                    const Cat = CATEGORY_ICONS[budget.category] || CATEGORY_ICONS.Other;
                    const isOver = spent > budget.amount;

                    return (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            key={budget.id}
                            className="card group"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-3 rounded-xl ${Cat.bg} ${Cat.color} dark:bg-white/5`}>
                                        <Cat.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="font-bold text-lg">{budget.category}</h3>
                                </div>
                                <button
                                    onClick={() => handleDeleteBudget(budget.id)}
                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between text-sm font-bold">
                                    <span className="text-muted uppercase tracking-wider">Spent</span>
                                    <span className={isOver ? 'text-red-600' : ''}>
                                        ₹{spent.toLocaleString()} / ₹{budget.amount.toLocaleString()}
                                    </span>
                                </div>

                                <div className="w-full bg-gray-100 dark:bg-white/5 h-3 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percentage}%` }}
                                        className={`h-full rounded-full ${isOver ? 'bg-red-500' : 'bg-primary-gold'}`}
                                    />
                                </div>

                                <div className="flex items-center space-x-2 pt-2">
                                    {isOver ? (
                                        <>
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                            <span className="text-xs text-red-500 font-bold">Over budget by ₹{(spent - budget.amount).toLocaleString()}</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            <span className="text-xs text-green-500 font-bold">₹{(budget.amount - spent).toLocaleString()} remaining</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}

                {budgets.length === 0 && !loading && (
                    <div className="col-span-full card border-dashed border-2 dark:border-white/10 py-20 text-center">
                        <Wallet className="h-12 w-12 text-primary-gold/20 mx-auto mb-4" />
                        <p className="text-muted font-medium italic">No budgets set for this month.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.95 }}
                            className="relative w-full max-w-md bg-white dark:bg-card-dark border dark:border-white/5 rounded-3xl p-8 shadow-2xl"
                        >
                            <h2 className="text-2xl font-bold mb-6">Set Category Budget</h2>
                            <form onSubmit={handleSaveBudget} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold mb-2 ml-1">Category</label>
                                    <select
                                        value={newBudget.category}
                                        onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                                        className="input-field font-medium appearance-none cursor-pointer"
                                    >
                                        {Object.keys(CATEGORY_ICONS).filter(c => c !== 'Salary').map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2 ml-1 text-muted">Monthly Limit (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        value={newBudget.amount}
                                        onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                                        className="input-field font-medium"
                                        placeholder="Enter amount"
                                    />
                                </div>
                                <div className="flex space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-3 px-6 bg-gray-100 dark:bg-white/5 dark:text-white font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 btn-yellow py-3 px-6 shadow-lg shadow-primary-gold/20"
                                    >
                                        Save Budget
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Budgets;
