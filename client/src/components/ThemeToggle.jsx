import { Moon, Sun, Circle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="relative h-10 w-10 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
      aria-label="Toggle theme"
      title={`Current: ${theme} (click to cycle)`}
    >
      <motion.div
        initial={false}
        animate={{
          scale: theme === 'light' ? 1 : 0,
          opacity: theme === 'light' ? 1 : 0,
          rotate: theme === 'light' ? 0 : 180,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="absolute"
      >
        <Sun className="h-5 w-5 text-foreground" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{
          scale: theme === 'dark' ? 1 : 0,
          opacity: theme === 'dark' ? 1 : 0,
          rotate: theme === 'dark' ? 0 : -180,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="absolute"
      >
        <Moon className="h-5 w-5 text-foreground" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{
          scale: theme === 'white' ? 1 : 0,
          opacity: theme === 'white' ? 1 : 0,
          rotate: theme === 'white' ? 0 : 180,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="absolute"
      >
        <Circle className="h-5 w-5 text-foreground fill-foreground" />
      </motion.div>
    </motion.button>
  );
}
