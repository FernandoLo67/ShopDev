const bgColors = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-brand-600',
  warning: 'bg-yellow-500',
};

export default function Toast({ toast, onClose }) {
  return (
    <div
      className={`${bgColors[toast.type] || bgColors.info} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[280px]`}
    >
      <p className="flex-1 text-sm">{toast.message}</p>
      <button
        onClick={onClose}
        className="text-white/80 hover:text-white text-lg leading-none"
      >
        &times;
      </button>
    </div>
  );
}
