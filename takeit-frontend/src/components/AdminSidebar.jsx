import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Store,
  Users,
  UtensilsCrossed,
  CreditCard,
  LogOut,
  Utensils,
} from "lucide-react";

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { label: "Orders", icon: ShoppingBag, path: "/admin/orders" },
  { label: "Restaurants", icon: Store },
  { label: "Customers", icon: Users },
  { label: "Dishes", icon: UtensilsCrossed },
  { label: "Payments", icon: CreditCard },
];

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (!confirmed) return;

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col bg-[#171923] text-white">
      <div className="flex h-[76px] items-center gap-3 border-b border-white/10 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500">
          <Utensils size={22} />
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">TAKE IT</h1>
          <p className="text-xs text-slate-400">Admin Panel</p>
        </div>
      </div>

      <div className="px-4 pt-8">
        <p className="mb-4 px-3 text-[10px] font-extrabold uppercase tracking-[0.25em] text-slate-500">
          Main Menu
        </p>

        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            const available = Boolean(item.path);

            return (
              <button
                key={item.label}
                type="button"
                disabled={!available}
                onClick={() => available && navigate(item.path)}
                title={
                  available
                    ? `Go to ${item.label}`
                    : `${item.label} page coming soon`
                }
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                  active
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-950/20"
                    : available
                      ? "text-slate-300 hover:bg-white/10 hover:text-white"
                      : "cursor-not-allowed text-slate-500"
                }`}
              >
                <Icon size={19} />
                <span>{item.label}</span>

                {!available && (
                  <span className="ml-auto text-[9px] uppercase tracking-wider text-slate-500">
                    Soon
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-white/10 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/20 font-bold text-orange-400">
            A
          </div>
          <div>
            <p className="text-sm font-bold">Administrator</p>
            <p className="text-xs text-slate-400">Platform Management</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut size={19} />
          Logout
        </button>
      </div>
    </aside>
  );
}