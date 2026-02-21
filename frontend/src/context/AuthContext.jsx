import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (!firebaseUser) {
                setUser(null);
                setLoading(false);
                return;
            }

            // Set basic user immediately to allow app to render faster
            setUser(firebaseUser);
            setLoading(false);

            // Fetch extra info in background
            try {
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                if (userDoc.exists()) {
                    setUser(prev => ({ ...prev, ...userDoc.data() }));
                }
            } catch (error) {
                console.error("Firestore user fetch error:", error);
            }
        });

        return unsubscribe;
    }, []);

    const loginWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const { user: firebaseUser } = result;

            const userRef = doc(db, 'users', firebaseUser.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                const userData = {
                    uid: firebaseUser.uid,
                    name: firebaseUser.displayName,
                    email: firebaseUser.email,
                    profileImage: firebaseUser.photoURL,
                    createdAt: new Date(),
                    phone: '',
                };
                await setDoc(userRef, userData);
                setUser({ ...firebaseUser, ...userData });
            }
        } catch (error) {
            console.error('Google Login Error:', error);
            throw error;
        }
    };

    const logout = () => signOut(auth);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-bg-light">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-gold"></div>
                    <p className="text-primary-grey font-medium animate-pulse">Initializing KharchaBook...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
