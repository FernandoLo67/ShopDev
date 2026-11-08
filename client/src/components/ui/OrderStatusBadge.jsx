const STATUS_STYLES = {
  PENDIENTE: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    dot: 'bg-yellow-500',
  },
  PAGADO: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    dot: 'bg-green-500',
  },
  ENVIADO: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    dot: 'bg-blue-500',
  },
};

const STATUS_LABELS = {
  PENDIENTE: 'Pendiente',
  PAGADO: 'Pagado',
  ENVIADO: 'Enviado',
};

export default function OrderStatusBadge({ status }) {
  const styles = STATUS_STYLES[status] || STATUS_STYLES.PENDIENTE;
  const label = STATUS_LABELS[status] || status;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${styles.bg} ${styles.text}`}
    >
      <span className={`w-2 h-2 rounded-full ${styles.dot}`} />
      {label}
    </span>
  );
}
