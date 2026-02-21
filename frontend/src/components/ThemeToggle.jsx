import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
    const { darkMode, toggleTheme } = useTheme();

    return (
        <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-gray-100 dark:bg-white/10 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-all border border-gray-200 dark:border-white/10"
            aria-label="Toggle Theme"
        >
            {darkMode ? (
                <Sun className="h-5 w-5 text-primary-gold" />
            ) : (
                <Moon className="h-5 w-5 text-black" />
            )}
        </motion.button>
    );
};

export default ThemeToggle;
