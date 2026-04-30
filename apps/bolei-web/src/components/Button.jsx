import clsx from 'clsx';

const VARIANTS = {
  primary:   'bg-green text-bg font-bold hover:bg-green-dark',
  secondary: 'bg-rim text-white font-semibold hover:bg-[#253354]',
  danger:    'bg-danger/15 text-danger font-semibold border border-danger/40 hover:bg-danger/25',
  ghost:     'text-sub font-semibold hover:text-white hover:bg-rim',
  outline:   'border border-green/50 text-green font-semibold hover:bg-green-glow',
};

export default function Button({
  label, onClick, variant = 'primary', disabled = false,
  loading = false, className = '', size = 'md', icon: Icon,
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg transition-all select-none',
        VARIANTS[variant],
        size === 'sm' ? 'text-xs px-3 py-1.5' : size === 'lg' ? 'text-base px-6 py-3' : 'text-sm px-4 py-2',
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon ? (
        <Icon size={14} />
      ) : null}
      {label}
    </button>
  );
}
