export default function Pagination({ page, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-2 rounded-lg border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Anterior
      </button>
      {pages.map((item, idx) =>
        item === '...' ? (
          <span key={`dots-${idx}`} className="px-2 text-gray-400">
            ...
          </span>
        ) : (
          <button
            key={item}
            onClick={() => onPageChange(item)}
            className={`px-3 py-2 rounded-lg text-sm ${
              item === page
                ? 'bg-brand-600 text-white'
                : 'border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {item}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-2 rounded-lg border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Siguiente
      </button>
    </div>
  );
}
