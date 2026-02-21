import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    Calendar,
    ArrowRight,
    Plus,
    ShoppingBag,
    Utensils,
    Car,
    Zap,
    Smartphone,
    Home,
    Briefcase,
    Layers,
    PieChart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CATEGORY_ICONS = {
    Food: { icon: Utensils, color: 'bg-orange-100 text-orange-600' },
    Shopping: { icon: ShoppingBag, color: 'bg-pink-100 text-pink-600' },
    Travel: { icon: Car, color: 'bg-blue-100 text-blue-600' },
    Bills: { icon: Zap, color: 'bg-yellow-100 text-yellow-600' },
    Recharge: { icon: Smartphone, color: 'bg-purple-100 text-purple-600' },
    Rent: { icon: Home, color: 'bg-indigo-100 text-indigo-600' },
    Salary: { icon: Briefcase, color: 'bg-green-100 text-green-600' },
    Other: { icon: Layers, color: 'bg-gray-100 text-gray-600' },
};

const Dashboard = () => {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState([]);
    const [stats, setStats] = useState({
        totalBalance: 0,
        totalIncome: 0,
        totalExpenses: 0,
        thisMonthExpense: 0
    });

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'expenses'),
            where('userId', '==', user.uid),
            orderBy('date', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const expenseData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date?.toDate() || new Date()
            }));

            setExpenses(expenseData);

            // Calculate Stats
            let income = 0;
            let expense = 0;
            let monthExpense = 0;
            const now = new Date();

            expenseData.forEach(item => {
                const amount = Number(item.amount);
                if (item.type === 'income') {
                    income += amount;
                } else {
                    expense += amount;
                    if (item.date.getMonth() === now.getMonth() && item.date.getFullYear() === now.getFullYear()) {
                        monthExpense += amount;
                    }
                }
            });

            setStats({
                totalBalance: income - expense,
                totalIncome: income,
                totalExpenses: expense,
                thisMonthExpense: monthExpense
            });
        });

        return unsubscribe;
    }, [user]);

    const StatCard = ({ title, amount, icon: Icon, color, trend }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card relative overflow-hidden group p-5 sm:p-6"
        >
            <div className={`absolute top-0 right-0 p-2 sm:p-3 rounded-bl-2xl bg-opacity-10 ${color}`}>
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <p className="text-primary-grey font-medium text-sm">{title}</p>
            <h3 className="text-2xl font-bold mt-2">₹ {amount.toLocaleString('en-IN')}</h3>
            {trend && (
                <p className={`text-xs mt-3 flex items-center font-semibold ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {trend > 0 ? '+' : ''}{trend}% from last month
                </p>
            )}
        </motion.div>
    );

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted font-medium mt-1">Check your financial health at a glance.</p>
                </div>
                <Link to="/add" className="btn-yellow flex items-center space-x-2 py-3 px-6 shadow-xl shadow-primary-gold/20 no-underline self-start">
                    <Plus className="h-5 w-5" />
                    <span>Add New Transaction</span>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Balance" amount={stats.totalBalance} icon={Wallet} color="text-primary-gold" />
                <StatCard title="Total Income" amount={stats.totalIncome} icon={TrendingUp} color="text-green-500" />
                <StatCard title="Total Expenses" amount={stats.totalExpenses} icon={TrendingDown} color="text-red-500" />
                <StatCard title="This Month" amount={stats.thisMonthExpense} icon={Calendar} color="text-blue-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Transactions */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Recent Transactions</h2>
                        <Link to="/history" className="text-primary-gold font-bold text-sm flex items-center hover:underline">
                            View All <ArrowRight className="h-4 w-4 ml-1" />
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {expenses.slice(0, 5).map((expense, idx) => {
                            const Cat = CATEGORY_ICONS[expense.category] || CATEGORY_ICONS.Other;
                            return (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    key={expense.id}
                                    className="card flex items-center justify-between hover:border-primary-gold/30 transition-colors p-4 sm:p-6"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className={`p-3 rounded-xl ${Cat.color}`}>
                                            <Cat.icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold">{expense.title}</p>
                                            <p className="text-xs text-muted font-medium mt-0.5">
                                                {expense.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {expense.paymentMethod}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold text-lg ${expense.type === 'income' ? 'text-green-600' : ''}`}>
                                            {expense.type === 'income' ? '+' : '-'} ₹ {Number(expense.amount).toLocaleString('en-IN')}
                                        </p>
                                        <p className="text-[10px] uppercase font-bold tracking-wider text-muted mt-0.5">
                                            {expense.category}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}

                        {expenses.length === 0 && (
                            <div className="card text-center py-12 border-dashed border-2">
                                <p className="text-muted font-medium italic">No transactions found. Start adding your expenses!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Insight / Placeholder for Chart */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold">Expense Breakdown</h2>
                    <div className="card h-[300px] sm:h-[400px] flex items-center justify-center border-dashed border-2">
                        <div className="text-center p-4">
                            <div className="bg-primary-gold/10 p-4 rounded-full inline-block mb-4">
                                <PieChart className="h-8 w-8 sm:h-10 sm:w-10 text-primary-gold" />
                            </div>
                            <p className="text-muted font-medium italic text-sm sm:text-base px-2">
                                Charts and deep analytics are coming in the next update!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
