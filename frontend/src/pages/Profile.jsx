import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { uploadToCloudinary } from '../services/cloudinary';
import {
    User,
    Mail,
    Phone,
    Camera,
    Save,
    Loader2,
    ShieldCheck,
    Zap,
    ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
    });
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(user?.profileImage || null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = user?.profileImage;
            if (image) {
                toast.loading('Uploading photo...', { id: 'photo' });
                imageUrl = await uploadToCloudinary(image);
                toast.success('Photo updated!', { id: 'photo' });
            }

            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                name: formData.name,
                phone: formData.phone,
                profileImage: imageUrl
            });

            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold">My Profile</h1>
                <p className="text-muted font-medium mt-1">Manage your personal information and preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Card: Account Summary */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="card text-center py-6 sm:py-10 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-primary-gold"></div>
                        <div className="relative inline-block group">
                            <img
                                src={preview || `https://ui-avatars.com/api/?name=${formData.name}&background=E2AF2F&color=000`}
                                alt="Profile"
                                className="h-24 w-24 sm:h-32 sm:w-32 rounded-3xl object-cover ring-4 ring-gray-50 dark:ring-white/5 shadow-xl mx-auto transition-transform group-hover:scale-105"
                            />
                            <label className="absolute bottom-[-10px] right-[-10px] bg-black dark:bg-primary-gold text-white dark:text-black p-2 sm:p-2.5 rounded-2xl cursor-pointer hover:opacity-90 transition-colors shadow-lg border-2 border-white dark:border-black">
                                <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
                                <input type="file" onChange={handleImageChange} className="hidden" accept="image/*" />
                            </label>
                        </div>

                        <div className="mt-6 sm:mt-8">
                            <h2 className="text-xl sm:text-2xl font-bold truncate px-4">{formData.name}</h2>
                            <p className="text-muted font-medium text-xs sm:text-sm mt-1">{user?.email}</p>
                        </div>

                        <div className="mt-6 sm:mt-8 flex justify-center space-x-2 flex-wrap gap-2 px-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-green-100 text-green-700">
                                <ShieldCheck className="h-3 w-3 mr-1" /> Verified
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-primary-gold/10 text-primary-gold">
                                <Zap className="h-3 w-3 mr-1" /> Pro Member
                            </span>
                        </div>
                    </div>

                    <div className="card bg-black dark:bg-[#1E1E1E] text-white p-6 sm:p-8 border-none">
                        <h3 className="font-bold text-base sm:text-lg mb-4">Quick Stats</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm border-b border-white/10 pb-4">
                                <span className="text-gray-400 font-medium">Joined Date</span>
                                <span className="font-bold">May 2025</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400 font-medium">Account Status</span>
                                <span className="text-green-500 font-bold uppercase tracking-wider">Active</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Card: Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card shadow-2xl dark:shadow-black/50 overflow-hidden p-5 sm:p-8">
                        <h3 className="text-lg sm:text-xl font-bold mb-6 sm:mb-8 flex items-center">
                            <User className="h-5 w-5 sm:h-6 sm:w-6 mr-3 text-primary-gold" />
                            Personal Details
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs sm:text-sm font-bold flex items-center ml-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3.5 h-4 w-4 sm:h-5 sm:w-5 text-muted" />
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="input-field pl-10"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs sm:text-sm font-bold flex items-center ml-1">Email (Read-only)</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3.5 h-4 w-4 sm:h-5 sm:w-5 text-muted opacity-50" />
                                        <input
                                            type="email"
                                            value={user?.email}
                                            disabled
                                            className="input-field pl-10 opacity-60 cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs sm:text-sm font-bold flex items-center ml-1">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3.5 h-4 w-4 sm:h-5 sm:w-5 text-muted" />
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+91 00000 00000"
                                            className="input-field pl-10"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-50 dark:border-white/5">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-yellow flex items-center justify-center space-x-2 py-3.5 sm:py-4 px-6 sm:px-8 shadow-xl shadow-primary-gold/20 w-full sm:w-auto"
                                >
                                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                    <span>Save Changes</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="card space-y-4">
                        <h3 className="text-lg font-bold border-b border-gray-50 dark:border-white/5 pb-4">Security & Preferences</h3>
                        <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-colors group">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-blue-600">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <span className="font-bold">Update Password</span>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-colors group">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg text-red-600">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <span className="font-bold text-red-600">Delete Account</span>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
