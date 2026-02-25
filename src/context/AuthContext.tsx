import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { toast } from 'sonner';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        // Initialize GoogleAuth for native
        if (Capacitor.isNativePlatform()) {
            GoogleAuth.initialize();
        }

        return () => unsubscribe();
    }, []);

    const loginWithGoogle = async () => {
        try {
            if (Capacitor.isNativePlatform()) {
                const googleUser = await GoogleAuth.signIn();
                const credential = GoogleAuthProvider.credential(googleUser.authentication.idToken);
                await signInWithCredential(auth, credential);
            } else {
                await signInWithPopup(auth, googleProvider);
            }
            toast.success("Successfully logged in!");
        } catch (error: any) {
            console.error("Login failed:", error);

            // Helpful error messages
            if (error.code === 'auth/popup-blocked') {
                toast.error("Popup blocked! Please allow popups for this site.");
            } else if (error.code === 'auth/unauthorized-domain') {
                toast.error("This domain is not authorized for login. Check Firebase Console.");
            } else {
                toast.error(`Login failed: ${error.message || 'Unknown error'}`);
            }
            throw error;
        }
    };

    const logout = async () => {
        try {
            if (Capacitor.isNativePlatform()) {
                await GoogleAuth.signOut();
            }
            await signOut(auth);
            toast.success("Logged out successfully.");
        } catch (error) {
            console.error("Logout failed:", error);
            toast.error("Failed to logout.");
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
