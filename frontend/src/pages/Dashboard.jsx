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
    Zap as ZapIcon,
    Smartphone,
    Home,
    Briefcase,
    Layers,
    PieChart as PieChartIcon,
    Bell,
    PlusCircle,
    Target,
    History as HistoryIcon,
    ArrowUpRight,
    Search
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis
} from 'recharts';

const CATEGORY_ICONS = {
    Food: { icon: Utensils, color: 'bg-orange-100 text-orange-600' },
    Shopping: { icon: ShoppingBag, color: 'bg-pink-100 text-pink-600' },
    Travel: { icon: Car, color: 'bg-blue-100 text-blue-600' },
    Bills: { icon: ZapIcon, color: 'bg-yellow-100 text-yellow-600' },
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
    const [categoryData, setCategoryData] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [insights, setInsights] = useState([]);
    const navigate = useNavigate();

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

            // Calculate Category Breakdown
            const cats = {};
            expenseData.filter(d => d.type === 'expense').forEach(d => {
                cats[d.category] = (cats[d.category] || 0) + Number(d.amount);
            });
            setCategoryData(Object.entries(cats).map(([name, value]) => ({ name, value })));
        }, (error) => {
            console.error("Dashboard expenses listener error:", error);
        });

        // Fetch Budgets for Insights
        const bq = query(collection(db, 'budgets'), where('userId', '==', user.uid));
        const unsubscribeBudgets = onSnapshot(bq, (snapshot) => {
            setBudgets(snapshot.docs.map(doc => doc.data()));
        }, (error) => {
            console.error("Dashboard budgets listener error:", error);
        });

        return () => {
            unsubscribe();
            unsubscribeBudgets();
        };
    }, [user]);

    useEffect(() => {
        if (!budgets.length || !expenses.length) return;

        const newInsights = [];
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        budgets.forEach(budget => {
            const spent = expenses
                .filter(e => e.type === 'expense' && e.category === budget.category && e.date >= startOfMonth)
                .reduce((acc, curr) => acc + Number(curr.amount), 0);

            if (spent > budget.amount * 0.8 && spent <= budget.amount) {
                newInsights.push({
                    type: 'warning',
                    message: `You've spent 80% of your ${budget.category} budget!`
                });
            } else if (spent > budget.amount) {
                newInsights.push({
                    type: 'danger',
                    message: `Over budget in ${budget.category} by ₹${(spent - budget.amount).toLocaleString()}!`
                });
            }
        });

        setInsights(newInsights.slice(0, 3));
    }, [budgets, expenses]);

    const COLORS = ['#E2AF2F', '#10B981', '#EF4444', '#3B82F6', '#8B5CF6', '#F59E0B'];

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
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Financial Overview</h1>
                    <p className="text-muted font-medium mt-1">Welcome back! Here's what's happening today.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => navigate('/history')}
                        className="p-3 bg-gray-100 dark:bg-white/5 rounded-xl text-muted hover:text-foreground transition-all"
                    >
                        <HistoryIcon className="h-5 w-5" />
                    </button>
                    <Link to="/add" className="btn-yellow flex items-center space-x-2 py-3 px-6 shadow-xl shadow-primary-gold/20 no-underline">
                        <Plus className="h-5 w-5" />
                        <span className="font-bold">New Entry</span>
                    </Link>
                </div>
            </div>

            {/* Quick Actions & Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Add Expense', icon: PlusCircle, path: '/add', color: 'text-primary-gold' },
                        { label: 'Set Budgets', icon: Target, path: '/budgets', color: 'text-blue-500' },
                        { label: 'View Analytics', icon: TrendingUp, path: '/analytics', color: 'text-green-500' },
                        { label: 'Export Data', icon: ArrowUpRight, path: '/history', color: 'text-purple-500' },
                    ].map((action, i) => (
                        <button
                            key={i}
                            onClick={() => navigate(action.path)}
                            className="card flex flex-col items-center justify-center p-4 hover:border-primary-gold/40 transition-all space-y-3 group"
                        >
                            <div className={`p-3 rounded-2xl bg-gray-50 dark:bg-black/20 group-hover:scale-110 transition-transform ${action.color}`}>
                                <action.icon className="h-6 w-6" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider">{action.label}</span>
                        </button>
                    ))}
                </div>

                <div className="card border-primary-gold/20 bg-primary-gold/5 dark:bg-primary-gold/10">
                    <h3 className="font-bold text-sm uppercase tracking-widest text-primary-gold mb-4 flex items-center">
                        <ZapIcon className="h-4 w-4 mr-2" />
                        Spending Insights
                    </h3>
                    <div className="space-y-4">
                        {insights.length > 0 ? insights.map((insight, i) => (
                            <div key={i} className="flex items-start space-x-3">
                                <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${insight.type === 'danger' ? 'bg-red-500' : 'bg-primary-gold'}`} />
                                <p className="text-sm font-medium leading-snug">{insight.message}</p>
                            </div>
                        )) : (
                            <p className="text-sm text-muted italic">Everything looks good! Keep it up.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Available Balance" amount={stats.totalBalance} icon={Wallet} color="text-primary-gold" />
                <StatCard title="Total Earnings" amount={stats.totalIncome} icon={TrendingUp} color="text-green-500" />
                <StatCard title="Total Spending" amount={stats.totalExpenses} icon={TrendingDown} color="text-red-500" />
                <StatCard title="Monthly Usage" amount={stats.thisMonthExpense} icon={Calendar} color="text-blue-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Transactions */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Latest Activity</h2>
                        <Link to="/history" className="text-primary-gold font-bold text-sm flex items-center hover:underline">
                            History <ArrowRight className="h-4 w-4 ml-1" />
                        </Link>
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {expenses.slice(0, 5).map((expense, idx) => {
                                const Cat = CATEGORY_ICONS[expense.category] || CATEGORY_ICONS.Other;
                                return (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        key={expense.id}
                                        className="card flex items-center justify-between hover:border-primary-gold/30 transition-colors p-4 sm:p-5"
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
                                                {expense.type === 'income' ? '+' : '-'} ₹{Number(expense.amount).toLocaleString('en-IN')}
                                            </p>
                                            <div className="flex justify-end mt-1">
                                                <span className="text-[10px] uppercase font-bold tracking-wider text-muted px-2 py-0.5 bg-gray-50 dark:bg-white/5 rounded-full">
                                                    {expense.category}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {expenses.length === 0 && (
                            <div className="card text-center py-20 border-dashed border-2 opacity-60">
                                <p className="text-muted font-bold text-lg">Your ledger is empty</p>
                                <p className="text-sm text-muted mt-1 italic">Start tracking your finances today!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Real Chart Analytics */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold">Category Distribution</h2>
                    <div className="card h-[350px] sm:h-[450px] p-2 flex flex-col justify-between">
                        {categoryData.length > 0 ? (
                            <div className="h-full w-full">
                                <ResponsiveContainer width="100%" height="80%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            contentStyle={{
                                                borderRadius: '16px',
                                                border: 'none',
                                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                                backgroundColor: '#1E1E1E'
                                            }}
                                            itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="px-4 space-y-2 pb-4">
                                    {categoryData.slice(0, 4).map((cat, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <div className="flex items-center text-xs font-bold uppercase tracking-wider text-muted">
                                                <div className="h-2 w-2 rounded-full mr-2" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                                {cat.name}
                                            </div>
                                            <span className="text-xs font-black">₹{cat.value.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 opacity-60">
                                <div className="bg-primary-gold/10 p-4 rounded-full mb-4">
                                    <PieChartIcon className="h-10 w-10 text-primary-gold" />
                                </div>
                                <p className="text-muted font-bold">No Data Available</p>
                                <p className="text-xs text-muted mt-1 italic">Add expenses to see your breakdown.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
