import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@mfe/auth';
import { Badge, Icon } from '@mfe/ui';

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!user) return null;
  const fullName = `${user.firstName} ${user.lastName}`.trim();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button
        type="button"
        className="-ml-1 rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Icon name="menu" />
      </button>

      <div className="flex-1" />

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          className="flex items-center gap-3 rounded-full py-1 pr-2 pl-1 hover:bg-slate-100"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <img src={user.image} alt="" className="size-8 rounded-full bg-slate-200" />
          <span className="hidden text-left sm:block">
            <span className="block text-sm font-medium text-slate-900">{fullName}</span>
            <span className="block text-xs text-slate-500">{user.email}</span>
          </span>
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 mt-2 w-60 rounded-xl bg-white p-2 shadow-lg ring-1 ring-slate-200"
          >
            <div className="border-b border-slate-100 px-3 pt-1 pb-3">
              <p className="text-sm font-medium text-slate-900">{fullName}</p>
              <p className="mb-2 text-xs text-slate-500">@{user.username}</p>
              <Badge tone={user.role === 'admin' ? 'brand' : user.role === 'moderator' ? 'amber' : 'neutral'}>
                {user.role}
              </Badge>
            </div>
            <button
              role="menuitem"
              type="button"
              className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
              onClick={() => {
                logout();
                navigate('/login', { replace: true });
              }}
            >
              <Icon name="logout" className="size-4" /> Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
