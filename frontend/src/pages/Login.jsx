import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { Mail, Lock, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast.success('Logged in successfully!');
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
        <div className="min-h-screen flex bg-white">
            {/* Left Side */}
            <div className="hidden lg:flex w-1/2 bg-black items-center justify-center p-12 text-white">
                <div className="max-w-md">
                    <h1 className="text-6xl font-bold mb-4 text-primary-gold">KharchaBook</h1>
                    <p className="text-2xl text-primary-grey">Track your daily expenses easily and smartly.</p>
                    <div className="mt-12 space-y-6">
                        <div className="flex items-center space-x-4">
                            <div className="bg-primary-gold/10 p-3 rounded-xl border border-primary-gold/20">
                                <div className="h-6 w-6 text-primary-gold">₹</div>
                            </div>
                            <p className="text-lg">Real-time expense tracking in INR</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side */}
            <div className="flex-1 flex items-center justify-center p-8 bg-[#F8F9FA]">
                <div className="max-w-md w-full glass-card p-10">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold">Welcome Back</h2>
                        <p className="text-primary-grey mt-2">Enter your details to access your dashboard</p>
                    </div>

                    <form onSubmit={handleEmailLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold mb-2 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-primary-grey" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-gold focus:border-transparent outline-none transition-all shadow-sm"
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
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-gold focus:border-transparent outline-none transition-all shadow-sm"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full btn-yellow flex items-center justify-center space-x-2 py-4 shadow-xl shadow-primary-gold/20"
                        >
                            <LogIn className="h-5 w-5" />
                            <span>{loading ? 'Logging in...' : 'Login'}</span>
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
                        <span>Google Login</span>
                    </button>

                    <p className="mt-8 text-center text-primary-grey font-medium">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary-gold font-bold hover:underline">
                            Register Now
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
