const VARIANTS = {
  loading: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400 animate-pulse' },
  success: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
  error: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
};

export default function StatusBadge({ variant = 'loading', children }) {
  const styles = VARIANTS[variant] || VARIANTS.loading;

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${styles.bg} ${styles.text}`}>
      <span className={`w-2 h-2 rounded-full ${styles.dot}`} />
      {children}
    </span>
  );
}
