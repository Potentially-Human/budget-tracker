import { useState, useEffect } from "react";
import { api } from "../api";
import { CATEGORIES } from "../constants";
import { styles } from "../styles";

export default function Dashboard({ token }) {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);

  useEffect(() => {
    api.getTransactions(token).then(setTransactions);
    api.getBudgets(token).then(setBudgets);
  }, [token]);

  const totalSpent = transactions.reduce((s, t) => s + t.amount, 0);
  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const remaining = totalBudget - totalSpent;

  // Group spending by category
  const byCategory = {};
  transactions.forEach(t => {
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
  });

  const stats = [
    { label: "Total Spent", value: `$${totalSpent.toFixed(2)}`, icon: "💰", color: "#FF6B6B" },
    { label: "Total Budget", value: `$${totalBudget.toFixed(2)}`, icon: "🎯", color: "#4ECDC4" },
    { label: "Remaining", value: `$${remaining.toFixed(2)}`, icon: "💚", color: remaining >= 0 ? "#40916c" : "#e53935" },
    { label: "Transactions", value: transactions.length, icon: "📝", color: "#AA96DA" },
  ];

  return (
    <div style={styles.pageContainer}>
      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {stats.map(s => (
          <div key={s.label} style={{ ...styles.card, borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: "22px" }}>{s.icon}</div>
            <div style={{ fontSize: "22px", fontWeight: "700", color: "#1a1a1a", marginTop: "4px" }}>{s.value}</div>
            <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Spending Breakdown */}
      <div style={styles.card}>
        <h3 style={{ margin: "0 0 16px", color: "#2d6a4f", fontSize: "16px" }}>Spending by Category</h3>
        {Object.keys(byCategory).length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: "40px" }}>🌱</div>
            <p style={{ color: "#888", margin: "8px 0 0", fontSize: "14px" }}>
              No transactions yet. Start logging your spending!
            </p>
          </div>
        ) : (
          Object.entries(byCategory)
            .sort((a, b) => b[1] - a[1])
            .map(([cat, amt]) => {
              const info = CATEGORIES.find(c => c.name === cat);
              const pct = totalSpent ? (amt / totalSpent) * 100 : 0;
              return (
                <div key={cat} style={{ marginBottom: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <span style={{ fontSize: "14px" }}>{info?.icon || "📦"} {cat}</span>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "#2d6a4f" }}>
                      ${amt.toFixed(2)} <span style={{ color: "#aaa", fontWeight: "400" }}>({pct.toFixed(0)}%)</span>
                    </span>
                  </div>
                  <div style={{ background: "#f0f0f0", borderRadius: "6px", height: "8px" }}>
                    <div style={{ background: info?.color || "#4ECDC4", borderRadius: "6px", height: "8px", width: `${pct}%` }} />
                  </div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}