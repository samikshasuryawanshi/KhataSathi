import { collection, addDoc, serverTimestamp, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase/config';

export const sendNotification = async (userId, title, message, type = 'info') => {
    try {
        await addDoc(collection(db, 'notifications'), {
            userId,
            title,
            message,
            type,
            read: false,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error sending notification:', error);
    }
};

export const checkBudgetAlerts = async (userId, expenses, budgets) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    for (const budget of budgets) {
        const spent = expenses
            .filter(e => e.type === 'expense' && e.category === budget.category && e.date >= startOfMonth)
            .reduce((acc, curr) => acc + Number(curr.amount), 0);

        if (spent > budget.amount) {
            // Check if alert already sent today for this category to avoid spam
            // For now, just send if over
            await sendNotification(
                userId,
                'Budget Exceeded!',
                `You have spent ₹${spent.toLocaleString()} in ${budget.category}, which exceeds your budget of ₹${budget.amount.toLocaleString()}.`,
                'alert'
            );
        }
    }
};
