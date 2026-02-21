import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Target, Zap } from 'lucide-react';

const COLORS = ['#E2AF2F', '#000000', '#4A4A4A', '#6E6E6E', '#FFD600', '#8884d8', '#82ca9d', '#ff7300'];

const Analytics = () => {
    const { user } = useAuth();
    const { darkMode } = useTheme();
    const [data, setData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);

    useEffect(() => {
        if (!user) return;

        const q = query(collection(db, 'expenses'), where('userId', '==', user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allData = snapshot.docs.map(doc => ({
                ...doc.data(),
                date: doc.data().date?.toDate() || new Date()
            }));

            setData(allData);

            // Category Wise Data
            const cats = {};
            allData.filter(d => d.type === 'expense').forEach(d => {
                cats[d.category] = (cats[d.category] || 0) + Number(d.amount);
            });
            setCategoryData(Object.entries(cats).map(([name, value]) => ({ name, value })));

            // Monthly Data (Last 6 Months)
            const months = {};
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            allData.forEach(d => {
                const key = `${monthNames[d.date.getMonth()]} ${d.date.getFullYear()}`;
                if (!months[key]) months[key] = { name: key, income: 0, expense: 0 };
                if (d.type === 'income') months[key].income += Number(d.amount);
                else months[key].expense += Number(d.amount);
            });

            setMonthlyData(Object.values(months).slice(-6));
        });

        return unsubscribe;
    }, [user]);

    const totalExpense = categoryData.reduce((acc, curr) => acc + curr.value, 0);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Financial Analytics</h1>
                <p className="text-muted font-medium mt-1">Deep insights into your spending patterns.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Monthly Trend */}
                <div className="card shadow-2xl dark:shadow-black/50 overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold flex items-center">
                            <TrendingUp className="h-5 w-5 mr-3 text-primary-gold" />
                            Income vs Expenses
                        </h2>
                    </div>
                    <div className="h-[300px] sm:h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? 'rgba(255,255,255,0.05)' : '#F1F1F1'} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: darkMode ? '#9CA3AF' : '#6B7280' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: darkMode ? '#9CA3AF' : '#6B7280' }} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                        backgroundColor: darkMode ? '#1E1E1E' : '#FFFFFF',
                                        color: darkMode ? '#FFFFFF' : '#000000'
                                    }}
                                    itemStyle={{ color: darkMode ? '#FFFFFF' : '#000000' }}
                                    cursor={{ fill: darkMode ? 'rgba(255,255,255,0.02)' : '#F8F9FA' }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar dataKey="expense" fill={darkMode ? '#E2AF2F' : '#000000'} radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="card shadow-2xl dark:shadow-black/50 overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold flex items-center">
                            <Target className="h-5 w-5 mr-3 text-primary-gold" />
                            Spending by Category
                        </h2>
                    </div>
                    <div className="h-[300px] sm:h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                        backgroundColor: darkMode ? '#1E1E1E' : '#FFFFFF',
                                        color: darkMode ? '#FFFFFF' : '#000000'
                                    }}
                                    itemStyle={{ color: darkMode ? '#FFFFFF' : '#000000' }}
                                />
                                <Legend iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Insights Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card bg-black dark:bg-[#1E1E1E] text-white border-none shadow-xl shadow-black/20">
                    <div className="p-3 bg-white/10 w-fit rounded-xl mb-4">
                        <Zap className="h-6 w-6 text-primary-gold" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Main Expense</h3>
                    <p className="text-gray-400 text-sm mt-1">Where most of your money goes</p>
                    <div className="mt-6">
                        <p className="text-3xl font-bold truncate text-white">
                            {categoryData.sort((a, b) => b.value - a.value)[0]?.name || 'N/A'}
                        </p>
                        <p className="text-primary-gold font-bold mt-1 text-sm uppercase tracking-widest">
                            Highest Focus
                        </p>
                    </div>
                </div>

                <div className="card md:col-span-2 flex flex-col sm:flex-row items-center justify-between gap-6 border-primary-gold/20 dark:border-white/5 bg-primary-gold/5 dark:bg-primary-gold/10">
                    <div className="space-y-2 w-full">
                        <h3 className="text-xl font-bold">Monthly Spending Limit</h3>
                        <p className="text-muted font-medium text-sm sm:text-base">You have spent 68% of your ideal budget this month.</p>
                        <div className="w-full bg-gray-200 dark:bg-white/10 h-3 rounded-full mt-4 overflow-hidden">
                            <div className="bg-primary-gold h-full rounded-full" style={{ width: '68%' }}></div>
                        </div>
                    </div>
                    <div className="shrink-0">
                        <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-8 border-primary-gold border-t-transparent animate-spin-slow"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
