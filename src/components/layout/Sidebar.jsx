"use client";

import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Wallet, BarChart3, Settings, LogOut, List } from "lucide-react";

export const Sidebar = ({ activeTab, locale = "fr" }) => {
  const router = useRouter();
  const { data: session } = useSession();

  const navItems = [
    { id: "transactions", icon: List, label: "Transactions", href: `/${locale}` },
    { id: "statistiques", icon: BarChart3, label: "Statistiques", href: `/${locale}/statistiques` },
    { id: "comptes", icon: Wallet, label: "Comptes", href: `/${locale}/comptes` },
    { id: "reglages", icon: Settings, label: "Réglages", href: `/${locale}/reglages` },
  ];

  const isActive = (id) => activeTab === id;

  const handleClick = (item) => {
    router.push(item.href);
  };

  return (
    <aside
      style={{
        width: "260px",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        backgroundColor: "var(--card-bg)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "20.5px 32px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              backgroundColor: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Wallet size={20} color="#FFFFFF" />
          </div>
          <span
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "var(--text-primary)",
            }}
          >
            MonBudget
          </span>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "16px 12px" }}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleClick(item)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "14px 16px",
              borderRadius: "12px",
              marginBottom: "4px",
              backgroundColor: isActive(item.id) ? "var(--hover)" : "transparent",
              borderLeft: isActive(item.id) ? "3px solid var(--accent)" : "3px solid transparent",
              color: isActive(item.id) ? "var(--accent)" : "var(--text-primary)",
              fontSize: "16px",
              fontWeight: isActive(item.id) ? "600" : "400",
              textAlign: "left",
              minHeight: "48px",
              cursor: "pointer",
            }}
          >
            <item.icon size={24} />
            {item.label}
          </button>
        ))}
      </nav>

      <div
        style={{
          padding: "16px 24px",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              fontWeight: "600",
              color: "var(--text-primary)",
            }}
          >
            {session?.user?.name 
              ? session.user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
              : session?.user?.email?.[0]?.toUpperCase() || "U"}
          </div>
          <span
            style={{
              fontSize: "15px",
              fontWeight: "500",
              color: "var(--text-primary)",
            }}
          >
            {session?.user?.name || session?.user?.email || "Utilisateur"}
          </span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
            color: "var(--text-secondary)",
            minHeight: "48px",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
};
