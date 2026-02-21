import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { uploadToCloudinary } from '../services/cloudinary';
import {
    Plus,
    Image as ImageIcon,
    X,
    Loader2,
    Calendar as CalendarIcon,
    Tag,
    CreditCard,
    FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['Food', 'Shopping', 'Travel', 'Bills', 'Recharge', 'Rent', 'Salary', 'Other'];
const PAYMENT_METHODS = ['Cash', 'UPI', 'Card'];

const AddExpense = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        type: 'expense',
        category: 'Food',
        paymentMethod: 'UPI',
        date: new Date().toISOString().split('T')[0],
        note: ''
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                return toast.error('Image size should be less than 2MB');
            }
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setImage(null);
        setPreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.amount || isNaN(formData.amount)) {
            return toast.error('Please enter a valid amount');
        }

        setLoading(true);
        try {
            let imageUrl = '';
            if (image) {
                toast.loading('Uploading image...', { id: 'upload' });
                imageUrl = await uploadToCloudinary(image);
                toast.success('Image uploaded!', { id: 'upload' });
            }

            const expenseData = {
                ...formData,
                amount: Number(formData.amount),
                image: imageUrl,
                userId: user.uid,
                date: new Date(formData.date),
                createdAt: serverTimestamp()
            };

            // Add to Firestore
            const docRef = await addDoc(collection(db, 'expenses'), expenseData);

            toast.success('Transaction added successfully!');
            navigate('/');
        } catch (error) {
            console.error(error);
            toast.error('Failed to add transaction');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold flex items-center">
                    <Plus className="h-8 w-8 mr-3 text-primary-gold" />
                    Add Transaction
                </h1>
            </div>

            <div className="card shadow-2xl dark:shadow-black/50 overflow-hidden">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Type Toggle */}
                    <div className="flex bg-gray-50 dark:bg-black/20 p-1.5 rounded-2xl border border-gray-100 dark:border-white/5">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: 'expense' })}
                            className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${formData.type === 'expense'
                                ? 'bg-black text-white shadow-lg dark:bg-primary-gold dark:text-black'
                                : 'text-muted hover:bg-white dark:hover:bg-white/5'
                                }`}
                        >
                            Expense
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: 'income' })}
                            className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${formData.type === 'income'
                                ? 'bg-green-600 text-white shadow-lg'
                                : 'text-muted hover:bg-white dark:hover:bg-white/5'
                                }`}
                        >
                            Income
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold flex items-center ml-1">
                                <FileText className="h-4 w-4 mr-2 text-primary-gold" />
                                Title
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Dinner with friends"
                                className="input-field font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold flex items-center ml-1">
                                <div className="h-4 w-4 mr-2 text-primary-gold font-bold flex items-center justify-center">₹</div>
                                Amount
                            </label>
                            <input
                                type="number"
                                required
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                placeholder="0.00"
                                className="input-field font-bold text-xl"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold flex items-center ml-1">
                                <Tag className="h-4 w-4 mr-2 text-primary-gold" />
                                Category
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="input-field font-medium appearance-none cursor-pointer"
                            >
                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold flex items-center ml-1">
                                <CreditCard className="h-4 w-4 mr-2 text-primary-gold" />
                                Payment Method
                            </label>
                            <select
                                value={formData.paymentMethod}
                                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                className="input-field font-medium appearance-none cursor-pointer"
                            >
                                {PAYMENT_METHODS.map(pm => <option key={pm} value={pm}>{pm}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold flex items-center ml-1">
                                <CalendarIcon className="h-4 w-4 mr-2 text-primary-gold" />
                                Date
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="input-field font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold flex items-center ml-1">
                                Note (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.note}
                                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                placeholder="Add a remark"
                                className="input-field font-medium"
                            />
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold flex items-center ml-1">
                            <ImageIcon className="h-4 w-4 mr-2 text-primary-gold" />
                            Bill Receipt (Optional)
                        </label>

                        {!preview ? (
                            <label className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                <div className="bg-primary-gold/10 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                                    <ImageIcon className="h-8 w-8 text-primary-gold" />
                                </div>
                                <span className="text-sm font-bold">Click to upload photo</span>
                                <span className="text-xs text-muted mt-1">Maximum size: 2MB</span>
                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>
                        ) : (
                            <div className="relative group overflow-hidden rounded-2xl h-64 border-4 border-white shadow-lg">
                                <img src={preview} alt="Bill Preview" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full btn-yellow py-4 flex items-center justify-center space-x-2 text-lg shadow-2xl shadow-primary-gold/30 hover:shadow-primary-gold/50"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-6 w-6 animate-spin" />
                                <span>Processing...</span>
                            </>
                        ) : (
                            <span>Save Transaction</span>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddExpense;
