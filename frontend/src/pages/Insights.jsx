import { useState } from "react";
import { api } from "../api";
import { styles } from "../styles";

export default function Insights({ token }) {
  const [narrative, setNarrative] = useState(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState("month");
  const [error, setError] = useState("");

  const fetchNarrative = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getNarrative(token, period);
      setNarrative(data);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div style={styles.pageContainer}>
      {/* Header */}
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>Financial Narrative</h2>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <select
            style={{ ...styles.input, width: "auto", padding: "8px 12px" }}
            value={period}
            onChange={e => setPeriod(e.target.value)}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button
            onClick={fetchNarrative}
            disabled={loading}
            style={{ ...styles.btnPrimary, whiteSpace: "nowrap", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Generating..." : "Generate Story"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={styles.errorBox}>
          <p style={{ color: "#e53935", margin: 0, fontSize: "14px" }}>{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!narrative && !error && (
        <div style={{ ...styles.card, ...styles.emptyState }}>
          <div style={{ fontSize: "48px" }}>🌸</div>
          <p style={{ color: "#888", margin: "12px 0 0", fontSize: "14px" }}>
            Click "Generate Story" to see your personalized financial narrative
          </p>
        </div>
      )}

      {/* Narrative */}
      {narrative && (
        <div>
          {/* Money Story */}
          <div style={{
            ...styles.card,
            marginBottom: "16px",
            background: "linear-gradient(135deg, #e8f5e9, #f1f8e9)",
            border: "1px solid #c8e6c9",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <span style={{ fontSize: "20px" }}>📖</span>
              <h3 style={{ margin: 0, color: "#2d6a4f", fontSize: "16px" }}>Your Money Story</h3>
            </div>
            <p style={{ margin: 0, color: "#444", fontSize: "15px", lineHeight: "1.6" }}>
              {narrative.narrative || "No narrative generated."}
            </p>
          </div>

          {/* Key Insights */}
          {narrative.key_insights && narrative.key_insights.length > 0 && (
            <div style={{ ...styles.card, marginBottom: "16px" }}>
              <h3 style={{ margin: "0 0 12px", color: "#2d6a4f", fontSize: "16px" }}>💡 Key Insights</h3>
              {narrative.key_insights.map((insight, i) => (
                <div key={i} style={{
                  display: "flex", gap: "10px", marginBottom: "10px",
                  padding: "10px 14px", background: "#f7faf7", borderRadius: "8px",
                }}>
                  <span style={{ color: "#40916c", fontWeight: "700" }}>{i + 1}.</span>
                  <span style={{ fontSize: "14px", color: "#555" }}>{insight}</span>
                </div>
              ))}
            </div>
          )}

          {/* Recommendations */}
          {narrative.recommendations && narrative.recommendations.length > 0 && (
            <div style={styles.card}>
              <h3 style={{ margin: "0 0 12px", color: "#2d6a4f", fontSize: "16px" }}>🎯 Recommendations</h3>
              {narrative.recommendations.map((rec, i) => (
                <div key={i} style={{
                  display: "flex", gap: "10px", marginBottom: "10px",
                  padding: "10px 14px", background: "#f0faf4",
                  borderRadius: "8px", border: "1px solid #c8e6c9",
                }}>
                  <span style={{ color: "#2d6a4f" }}>✓</span>
                  <span style={{ fontSize: "14px", color: "#555" }}>{rec}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}