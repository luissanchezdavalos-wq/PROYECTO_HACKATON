export default function AppShell({ screens, activeId, onNavigate, children }) {
  return (
    <div className="min-h-screen bg-cream-50">
      <header className="sticky top-0 z-30 border-b border-cream-300 bg-cream-50/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-leaf-700 text-white" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M12 2C7 6 5 10 5 14a7 7 0 0 0 14 0c0-4-2-8-7-12Zm0 18a5 5 0 0 1-5-5c0-2.4 1.2-4.9 5-9 3.8 4.1 5 6.6 5 9a5 5 0 0 1-5 5Z" />
              </svg>
            </span>
            <div className="leading-tight">
              <p className="text-base font-semibold text-leaf-900">AgroShift</p>
              <p className="text-xs text-soil-500">Environmental assessment · NASA</p>
            </div>
          </div>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {screens.map((screen) => (
              <NavButton key={screen.id} screen={screen} active={screen.id === activeId} onClick={onNavigate} />
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 sm:pt-8 md:pb-12">{children}</main>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 gap-1 border-t border-cream-300 bg-white/95 px-2 py-2 backdrop-blur md:hidden"
        aria-label="Main mobile"
      >
        {screens.map((screen) => (
          <MobileNavButton key={screen.id} screen={screen} active={screen.id === activeId} onClick={onNavigate} />
        ))}
      </nav>
    </div>
  )
}

function NavButton({ screen, active, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(screen.id)}
      aria-current={active ? 'page' : undefined}
      className={`rounded-xl px-3.5 py-2 text-sm font-medium transition duration-200 ${
        active ? 'bg-leaf-700 text-white' : 'text-soil-700 hover:bg-cream-200 hover:text-leaf-900'
      }`}
    >
      {screen.label}
    </button>
  )
}

function MobileNavButton({ screen, active, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(screen.id)}
      aria-current={active ? 'page' : undefined}
      className={`flex min-h-12 items-center justify-center rounded-xl px-1 py-1.5 text-center text-[11px] font-medium leading-tight transition duration-200 ${
        active ? 'bg-leaf-700 text-white' : 'text-soil-700 hover:bg-cream-200'
      }`}
    >
      {screen.shortLabel}
    </button>
  )
}
