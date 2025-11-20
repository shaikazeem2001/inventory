import { twMerge } from 'tailwind-merge';

export function Card({ className, children, ...props }) {
  return (
    <div
      className={twMerge('bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors', className)}
      {...props}
    >
      {children}
    </div>
  );
}
