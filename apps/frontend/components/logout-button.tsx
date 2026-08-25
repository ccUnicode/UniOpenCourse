import { LogOut } from 'lucide-react';
import { logout } from '@/lib/auth-cookies';
const handleLogout = async () => {
  await logout();
  window.location.replace('/');
};
export default function LogoutButton({ message }: { message: string }) {
  return (
    <button
      onClick={handleLogout}
      className="inline-flex items-center gap-2 rounded-[10px] border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
    >
      <LogOut className="w-4 h-4" />
      {message}
    </button>
  );
}
