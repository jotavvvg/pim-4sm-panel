type ActionButtonProps = {
  kind: 'edit' | 'delete' | 'view';
  label: string;
  onClick: () => void;
};

export function ActionButton({ kind, label, onClick }: ActionButtonProps) {
  const icon = (() => {
    switch (kind) {
      case 'edit':
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm14.71-9.04a1.003 1.003 0 0 0 0-1.42l-2.33-2.33a1.003 1.003 0 0 0-1.42 0L14.1 5.9l3.75 3.75 0.86-.86z" />
          </svg>
        );
      case 'delete':
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 3h6l1 2h4v2H4V5h4l1-2zm-1 7h2v8H8v-8zm6 0h2v8h-2v-8zM5 9h14l-1 11H6L5 9z" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 5c5.5 0 9 7 9 7s-3.5 7-9 7-9-7-9-7 3.5-7 9-7zm0 2.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5zm0 2a2.5 2.5 0 1 0 2.5 2.5A2.5 2.5 0 0 0 12 9.5z" />
          </svg>
        );
    }
  })();

  return (
    <button type="button" className={`icon-button ${kind}`} onClick={onClick} aria-label={label} title={label}>
      {icon}
    </button>
  );
}
