const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "transactions", label: "Transactions"},
  { id: "budgets", label: "Budgets" },
  { id: "insights", label: "Insights"},
  { id: "peers", label: "Peers"
    // , icon: "👥" 
  },
];

export default function Navbar({ activeTab, setActiveTab, onLogout, user }) {
  return (
    <nav style={{
      background: "linear-gradient(135deg, #2d6a4f, #40916c)",
      padding: "12px 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <span style={{ color: "#fff", fontSize: "20px", fontWeight: "700" }}>[logo] Bloom</span>
        <div style={{ display: "flex", gap: "4px" }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                background: activeTab === t.id ? "rgba(255,255,255,0.2)" : "transparent",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "7px 13px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: activeTab === t.id ? "600" : "400",
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px" }}>Hi {user?.firstname}</span>
        <button
          onClick={onLogout}
          style={{
            background: "rgba(255,255,255,0.15)",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "6px 14px",
            cursor: "pointer",
            fontSize: "13px",
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
