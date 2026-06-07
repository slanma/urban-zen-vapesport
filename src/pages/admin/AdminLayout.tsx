import { useEffect, useState } from "react";
import { Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Loader2, LayoutDashboard, Package, Sparkles, ShoppingCart, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const nav = [
  { to: "/admin", label: "Přehled", icon: LayoutDashboard, end: true },
  { to: "/admin/produkty", label: "Produkty", icon: Package },
  { to: "/admin/sluzby", label: "Služby", icon: Sparkles },
  { to: "/admin/objednavky", label: "Objednávky", icon: ShoppingCart },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [checking, setChecking] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setChecking(false);
      return;
    }
    let isActive = true;
    setChecking(true);
    (async () => {
      const { data: isAdmin, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      if (!isActive) return;
      if (error || !isAdmin) {
        setAccessDenied(true);
        setChecking(false);
        await signOut();
        return;
      }
      setAccessDenied(false);
      setChecking(false);
    })();
    return () => {
      isActive = false;
    };
  }, [user, authLoading, signOut]);

  const handleLogout = async () => {
    await signOut();
    navigate("/admin-login");
  };

  if (authLoading || checking) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || accessDenied) {
    return <Navigate to="/admin-login" replace />;
  }

  return (
    <div className="min-h-screen bg-[hsl(0_0%_98%)] flex">
      <aside className="w-60 bg-background border-r border-border flex flex-col shrink-0 sticky top-0 h-screen">
        <div className="h-16 flex items-center px-5 border-b border-border">
          <span className="font-heading font-bold text-foreground tracking-tight">
            Vapesport Admin
          </span>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Odhlásit se</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
