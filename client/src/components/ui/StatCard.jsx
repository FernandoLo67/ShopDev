export default function StatCard({ label, value, icon, trend }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 flex items-start justify-between gap-4">
      <div>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{label}</p>
        {trend && <p className="text-xs text-gray-400 mt-2">{trend}</p>}
      </div>
      {icon && (
        <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
          {icon}
        </div>
      )}
    </div>
  );
}
