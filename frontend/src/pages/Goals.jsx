import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Target,
    Plus,
    Trash2,
    TrendingUp,
    Trophy,
    Calendar,
    ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const Goals = () => {
    const { user } = useAuth();
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newGoal, setNewGoal] = useState({ title: '', targetAmount: '', currentAmount: '0', deadline: '' });

    useEffect(() => {
        if (!user) return;

        const q = query(collection(db, 'goals'), where('userId', '==', user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setGoals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });

        return unsubscribe;
    }, [user]);

    const handleCreateGoal = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, 'goals'), {
                userId: user.uid,
                title: newGoal.title,
                targetAmount: Number(newGoal.targetAmount),
                currentAmount: Number(newGoal.currentAmount),
                deadline: newGoal.deadline,
                createdAt: new Date()
            });
            toast.success('Goal created!');
            setShowModal(false);
            setNewGoal({ title: '', targetAmount: '', currentAmount: '0', deadline: '' });
        } catch (error) {
            toast.error('Failed to create goal');
        }
    };

    const handleUpdateProgress = async (goalId, newAmount) => {
        try {
            await updateDoc(doc(db, 'goals', goalId), {
                currentAmount: Number(newAmount)
            });
        } catch (error) {
            toast.error('Failed to update progress');
        }
    };

    const handleDeleteGoal = async (id) => {
        if (window.confirm('Are you sure you want to delete this goal?')) {
            try {
                await deleteDoc(doc(db, 'goals', id));
                toast.success('Goal removed');
            } catch (error) {
                toast.error('Failed to delete goal');
            }
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Savings Goals</h1>
                    <p className="text-muted font-medium mt-1">Dream big, save smart.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-yellow flex items-center space-x-2 py-3 px-6 shadow-xl shadow-primary-gold/20 self-start"
                >
                    <Plus className="h-5 w-5" />
                    <span>Create New Goal</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {goals.map((goal) => {
                    const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                    const isCompleted = percentage === 100;

                    return (
                        <motion.div
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={goal.id}
                            className="card flex flex-col justify-between group h-full p-5 sm:p-8"
                        >
                            <div>
                                <div className="flex items-start justify-between mb-5 sm:mb-6">
                                    <div className="flex items-center space-x-3 sm:space-x-4">
                                        <div className={`p-3 sm:p-4 rounded-2xl ${isCompleted ? 'bg-green-100 dark:bg-green-900/20 text-green-600' : 'bg-primary-gold/10 text-primary-gold'}`}>
                                            {isCompleted ? <Trophy className="h-6 w-6 sm:h-8 sm:w-8" /> : <Target className="h-6 w-6 sm:h-8 sm:w-8" />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg sm:text-xl">{goal.title}</h3>
                                            <div className="flex items-center text-muted text-[10px] sm:text-xs font-bold mt-1 uppercase tracking-widest">
                                                <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                                                By {new Date(goal.deadline).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteGoal(goal.id)}
                                        className="p-1.5 sm:p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all md:opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-1">
                                            <p className="text-muted text-[10px] sm:text-xs font-bold uppercase tracking-widest">Saved So Far</p>
                                            <p className="text-xl sm:text-2xl font-black">₹{goal.currentAmount.toLocaleString()}</p>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <p className="text-muted text-[10px] sm:text-xs font-bold uppercase tracking-widest">Target</p>
                                            <p className="text-base sm:text-lg font-bold text-primary-gold">₹{goal.targetAmount.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="relative pt-2">
                                        <div className="w-full bg-gray-100 dark:bg-white/5 h-4 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                className={`h-full rounded-full ${isCompleted ? 'bg-green-500' : 'bg-primary-gold'}`}
                                            />
                                        </div>
                                        <span className="absolute -top-3 right-0 text-xs font-black text-primary-gold">
                                            {Math.round(percentage)}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row items-center gap-4">
                                <input
                                    type="range"
                                    min="0"
                                    max={goal.targetAmount}
                                    value={goal.currentAmount}
                                    onChange={(e) => handleUpdateProgress(goal.id, e.target.value)}
                                    className="w-full accent-primary-gold h-2 bg-gray-100 dark:bg-white/5 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex items-center space-x-1 text-primary-gold font-bold text-[10px] sm:text-sm bg-primary-gold/10 px-3 py-1.5 rounded-lg whitespace-nowrap self-end sm:self-center">
                                    <span>Update Progress</span>
                                    <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}

                {goals.length === 0 && !loading && (
                    <div className="col-span-full card border-dashed border-2 dark:border-white/10 py-20 text-center">
                        <Trophy className="h-12 w-12 text-primary-gold/20 mx-auto mb-4" />
                        <p className="text-muted font-medium italic">You haven't set any savings goals yet.</p>
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
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative w-full max-w-md bg-white dark:bg-card-dark border dark:border-white/5 rounded-3xl p-8 shadow-2xl"
                        >
                            <h2 className="text-2xl font-bold mb-6">Create Savings Goal</h2>
                            <form onSubmit={handleCreateGoal} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold mb-2 ml-1 text-muted">Goal Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newGoal.title}
                                        onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                                        className="input-field font-medium"
                                        placeholder="e.g. New iPhone, Vacation"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-2 ml-1 text-muted">Target (₹)</label>
                                        <input
                                            type="number"
                                            required
                                            value={newGoal.targetAmount}
                                            onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                                            className="input-field font-medium"
                                            placeholder="50,000"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 ml-1 text-muted">Initial (₹)</label>
                                        <input
                                            type="number"
                                            value={newGoal.currentAmount}
                                            onChange={(e) => setNewGoal({ ...newGoal, currentAmount: e.target.value })}
                                            className="input-field font-medium"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2 ml-1 text-muted">Target Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={newGoal.deadline}
                                        onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                                        className="input-field font-medium"
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
                                        Create Goal
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

export default Goals;
