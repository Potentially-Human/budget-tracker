import { useState, useEffect } from "react";
import { api } from "../api";
import { CATEGORIES } from "../constants";
import { styles } from "../styles";

export default function Transactions({ token }) {
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ amount: "", category: CATEGORIES[0].name, merchant: "", notes: "" });
  const [error, setError] = useState("");

  const fetchTransactions = () => api.getTransactions(token).then(setTransactions);
  useEffect(() => { fetchTransactions(); }, [token]);

  const handleAdd = async () => {
    setError("");
    if (!form.amount || isNaN(form.amount)) return setError("Enter a valid amount");
    try {
      await api.addTransaction(token, {
        amount: parseFloat(form.amount),
        category: form.category,
        merchant: form.merchant || null,
        notes: form.notes || null,
        date: new Date().toISOString(),
      });
      setForm({ amount: "", category: CATEGORIES[0].name, merchant: "", notes: "" });
      setShowForm(false);
      fetchTransactions();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div style={styles.pageContainer}>
      {/* Header */}
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>Transactions</h2>
        <button onClick={() => setShowForm(!showForm)} style={styles.btnPrimary}>+ Add</button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div style={{ ...styles.card, marginBottom: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <input style={styles.input} type="number" placeholder="Amount ($)" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
            <select style={styles.input} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
            </select>
            <input style={styles.input} type="text" placeholder="Merchant (optional)" value={form.merchant} onChange={e => setForm({ ...form, merchant: e.target.value })} />
            <input style={styles.input} type="text" placeholder="Notes (optional)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
          {error && <p style={{ color: "#e53935", fontSize: "13px", margin: "8px 0 0" }}>{error}</p>}
          <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
            <button onClick={handleAdd} style={styles.btnPrimary}>Add</button>
            <button onClick={() => setShowForm(false)} style={styles.btnSecondary}>Cancel</button>
          </div>
        </div>
      )}

      {/* Transaction List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {transactions.length === 0 && (
          <div style={{ ...styles.card, ...styles.emptyState }}>
            <div style={{ fontSize: "40px" }}>💸</div>
            <p style={{ color: "#888", margin: "8px 0 0", fontSize: "14px" }}>No transactions yet</p>
          </div>
        )}
        {transactions.map(t => {
          const info = CATEGORIES.find(c => c.name === t.category);
          return (
            <div key={t.id} style={{ ...styles.card, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "42px", height: "42px", borderRadius: "10px",
                  background: (info?.color || "#ccc") + "22",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px",
                }}>
                  {info?.icon || "📦"}
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#1a1a1a" }}>{t.merchant || t.category}</div>
                  <div style={{ fontSize: "12px", color: "#999" }}>
                    {t.category}{t.input_method === "voice" ? " • 🎤 Voice" : ""}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: "16px", fontWeight: "700", color: "#e53935" }}>-${t.amount.toFixed(2)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}