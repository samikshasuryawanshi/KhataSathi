import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const { loginWithGoogle } = useAuth();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return toast.error('Passwords do not match');
        }

        setLoading(true);
        try {
            const { user: firebaseUser } = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );

            await updateProfile(firebaseUser, { displayName: formData.name });

            const userData = {
                uid: firebaseUser.uid,
                name: formData.name,
                email: formData.email,
                profileImage: '',
                createdAt: new Date(),
                phone: '',
            };

            await setDoc(doc(db, 'users', firebaseUser.uid), userData);
            toast.success('Account created successfully!');
            navigate('/');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
            toast.success('Logged in with Google!');
            navigate('/');
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] p-6">
            <div className="max-w-md w-full glass-card p-10">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-black italic decoration-primary-gold decoration-4 underline-offset-8 underline">
                        Kharcha<span className="text-primary-gold">Book</span>
                    </h2>
                    <p className="text-primary-grey mt-4 font-medium">Join us to manage your wealth better</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold mb-2 ml-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3.5 h-5 w-5 text-primary-grey" />
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="John Doe"
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-gold outline-none transition-all shadow-sm"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2 ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-primary-grey" />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="name@example.com"
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-gold outline-none transition-all shadow-sm"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2 ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-primary-grey" />
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-gold outline-none transition-all shadow-sm"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2 ml-1">Confirm Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-primary-grey" />
                            <input
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-gold outline-none transition-all shadow-sm"
                                required
                            />
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full btn-yellow flex items-center justify-center space-x-2 py-4 shadow-xl shadow-primary-gold/20"
                    >
                        <UserPlus className="h-5 w-5" />
                        <span>{loading ? 'Creating Account...' : 'Register'}</span>
                    </button>
                </form>

                <div className="relative my-8 text-center text-sm">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <span className="relative px-4 bg-[#F8F9FA] text-primary-grey">OR CONTINUE WITH</span>
                </div>

                <button
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center space-x-3 bg-white border border-gray-200 py-3.5 rounded-xl hover:bg-gray-50 transition-all font-semibold shadow-sm"
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="h-5 w-5" alt="Google" />
                    <span>Google Register</span>
                </button>

                <p className="mt-8 text-center text-primary-grey font-medium">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary-gold font-bold hover:underline">
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
