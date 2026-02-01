import { useState, useEffect } from "react";
import { api } from "../api";
import { CATEGORIES } from "../constants";
import { styles } from "../styles";

export default function Budgets({ token }) {
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: CATEGORIES[0].name, amount: "", period: "monthly" });
  const [error, setError] = useState("");

  const fetchData = () => {
    api.getBudgets(token).then(setBudgets);
    api.getTransactions(token).then(setTransactions);
  };
  useEffect(() => { fetchData(); }, [token]);

  const handleAdd = async () => {
    setError("");
    if (!form.amount || isNaN(form.amount)) return setError("Enter a valid amount");
    try {
      await api.addBudget(token, {
        category: form.category,
        amount: parseFloat(form.amount),
        period: form.period,
      });
      setForm({ category: CATEGORIES[0].name, amount: "", period: "monthly" });
      setShowForm(false);
      fetchData();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div style={styles.pageContainer}>
      {/* Header */}
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>Budgets</h2>
        <button onClick={() => setShowForm(!showForm)} style={styles.btnPrimary}>+ Budget</button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div style={{ ...styles.card, marginBottom: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
            <select style={styles.input} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
            </select>
            <input style={styles.input} type="number" placeholder="Budget ($)" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
            <select style={styles.input} value={form.period} onChange={e => setForm({ ...form, period: e.target.value })}>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          {error && <p style={{ color: "#e53935", fontSize: "13px", margin: "8px 0 0" }}>{error}</p>}
          <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
            <button onClick={handleAdd} style={styles.btnPrimary}>Add</button>
            <button onClick={() => setShowForm(false)} style={styles.btnSecondary}>Cancel</button>
          </div>
        </div>
      )}

      {/* Budget List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {budgets.length === 0 && (
          <div style={{ ...styles.card, ...styles.emptyState }}>
            <div style={{ fontSize: "40px" }}>🎯</div>
            <p style={{ color: "#888", margin: "8px 0 0", fontSize: "14px" }}>No budgets set yet</p>
          </div>
        )}
        {budgets.map(b => {
          const spent = transactions
            .filter(t => t.category === b.category)
            .reduce((s, t) => s + t.amount, 0);
          const pct = b.amount ? Math.min((spent / b.amount) * 100, 100) : 0;
          const status = pct >= 100 ? "Exceeded" : pct >= 80 ? "Warning" : "On Track";
          const statusColor = pct >= 100 ? "#e53935" : pct >= 80 ? "#fb8c00" : "#2d6a4f";
          const info = CATEGORIES.find(c => c.name === b.category);

          return (
            <div key={b.id} style={styles.card}>
              {/* Top row: category + status */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "22px" }}>{info?.icon || "📦"}</span>
                  <div>
                    <div style={{ fontWeight: "600", color: "#1a1a1a", fontSize: "15px" }}>{b.category}</div>
                    <div style={{ fontSize: "12px", color: "#999", textTransform: "capitalize" }}>{b.period}</div>
                  </div>
                </div>
                <span style={{
                  background: statusColor + "18",
                  color: statusColor,
                  padding: "4px 10px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "600",
                }}>
                  {status}
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ background: "#f0f0f0", borderRadius: "8px", height: "10px", marginBottom: "8px" }}>
                <div style={{ background: statusColor, borderRadius: "8px", height: "10px", width: `${pct}%` }} />
              </div>

              {/* Spent vs limit */}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#666" }}>
                <span>Spent: <strong style={{ color: statusColor }}>${spent.toFixed(2)}</strong></span>
                <span>Limit: <strong>${b.amount.toFixed(2)}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}