export const inputClass =
  'w-full rounded-xl border border-cream-300 bg-white px-3.5 py-2.5 text-base text-soil-900 shadow-sm transition focus:border-leaf-500 focus:outline-none focus:ring-4 focus:ring-leaf-100 disabled:opacity-60'

const BUTTON_VARIANTS = {
  primary: 'bg-leaf-700 text-white shadow-sm hover:bg-leaf-800 disabled:bg-leaf-300',
  secondary: 'border border-cream-300 bg-white text-leaf-900 hover:border-leaf-300 hover:bg-leaf-50',
  wheat: 'border border-wheat-300 bg-wheat-100 text-wheat-900 hover:bg-wheat-200',
}

export function Button({ variant = 'primary', className = '', type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition duration-200 active:scale-[0.98] disabled:cursor-not-allowed ${BUTTON_VARIANTS[variant]} ${className}`}
      {...props}
    />
  )
}

export function Card({ as: Tag = 'div', className = '', children }) {
  return (
    <Tag className={`rounded-2xl border border-cream-300 bg-white p-5 shadow-sm sm:p-6 ${className}`}>{children}</Tag>
  )
}

export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <header className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-wider text-leaf-700">{eyebrow}</p>}
        <h1 className="text-2xl font-semibold leading-tight text-leaf-900 sm:text-3xl">{title}</h1>
        {description && <p className="max-w-2xl text-base leading-relaxed text-soil-700">{description}</p>}
      </div>
      {action}
    </header>
  )
}

const TONES = {
  neutral: 'border-cream-300 bg-cream-100 text-soil-700',
  live: 'border-leaf-300 bg-leaf-100 text-leaf-900',
  cache: 'border-moss-300 bg-moss-100 text-moss-900',
  demo: 'border-wheat-500 bg-wheat-100 text-wheat-900',
  error: 'border-red-300 bg-red-50 text-red-900',
}

export function Badge({ tone = 'neutral', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
