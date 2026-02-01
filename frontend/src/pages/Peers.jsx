import { useState, useEffect } from "react";
import { api } from "../api";
import { styles } from "../styles";

export default function Peers({ token, user }) {
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState("");

  // Auto-fetch if user has income_range set
  useEffect(() => {
    if (user?.income_range) {
      setJoined(true);
      fetchComparison();
    }
  }, [token]);

  const handleJoin = async () => {
    setLoading(true);
    setError("");
    try {
      await api.joinPeerGroup(token);
      setJoined(true);
      await fetchComparison();
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const fetchComparison = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getPeerComparison(token);
      setComparison(data);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  // Not joined yet / no income range set
  if (!joined) {
    return (
      <div style={styles.pageContainer}>
        <div style={{ ...styles.card, ...styles.emptyState }}>
          <div style={{ fontSize: "48px" }}>👥</div>
          <h3 style={{ color: "#2d6a4f", margin: "12px 0 8px", fontSize: "18px" }}>Join a Spending Circle</h3>
          <p style={{ color: "#888", margin: "0 0 20px", fontSize: "14px", maxWidth: "360px", marginLeft: "auto", marginRight: "auto" }}>
            Compare your spending with anonymous peers in your income range. Set your income range to get started.
          </p>
          {error && <p style={{ color: "#e53935", fontSize: "13px", margin: "0 0 12px" }}>{error}</p>}
          <button onClick={handleJoin} disabled={loading} style={{ ...styles.btnPrimary, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Joining..." : "Join Peer Group"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      {/* Header */}
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>Spending Circles</h2>
        <button onClick={fetchComparison} disabled={loading} style={{ ...styles.btnPrimary, opacity: loading ? 0.7 : 1 }}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={styles.errorBox}>
          <p style={{ color: "#e53935", margin: 0, fontSize: "14px" }}>{error}</p>
        </div>
      )}

      {/* No comparison data */}
      {!comparison && !error && (
        <div style={{ ...styles.card, ...styles.emptyState }}>
          <div style={{ fontSize: "40px" }}>📊</div>
          <p style={{ color: "#888", margin: "8px 0 0", fontSize: "14px" }}>
            Not enough peers yet to generate comparisons. Check back later!
          </p>
        </div>
      )}

      {/* Comparison data */}
      {comparison && (
        <div>
          {/* Summary Card */}
          <div style={{
            ...styles.card,
            marginBottom: "16px",
            background: "linear-gradient(135deg, #e3f2fd, #e8eaf6)",
            border: "1px solid #bbdefb",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "14px", color: "#666" }}>Income Range</div>
                <div style={{ fontSize: "18px", fontWeight: "700", color: "#1a1a1a" }}>{comparison.income_range}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "14px", color: "#666" }}>Peers Compared</div>
                <div style={{ fontSize: "18px", fontWeight: "700", color: "#1a1a1a" }}>{comparison.peer_count}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "14px", color: "#666" }}>Your Rank</div>
                <div style={{ fontSize: "18px", fontWeight: "700", color: "#2d6a4f", textTransform: "capitalize" }}>
                  {comparison.overall_rank?.replace("_", " ") || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Category Comparisons */}
          <h3 style={{ color: "#2d6a4f", fontSize: "16px", margin: "0 0 12px" }}>Category Breakdown</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {comparison.comparisons && comparison.comparisons.map((c, i) => {
              const diff = c.your_spending - c.peer_avg;
              const isOver = diff > 0;
              const pctDiff = c.peer_avg ? Math.abs((diff / c.peer_avg) * 100).toFixed(0) : 0;

              return (
                <div key={i} style={styles.card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <h4 style={{ margin: 0, color: "#1a1a1a", fontSize: "15px" }}>{c.category}</h4>
                    <span style={{
                      background: isOver ? "#fff3f3" : "#f0faf4",
                      color: isOver ? "#e53935" : "#2d6a4f",
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}>
                      {isOver ? `+${pctDiff}%` : `-${pctDiff}%`} vs peers
                    </span>
                  </div>

                  {/* Bar comparison */}
                  <div style={{ marginBottom: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#888", marginBottom: "4px" }}>
                      <span>You</span>
                      <span>${c.your_spending.toFixed(2)}</span>
                    </div>
                    <div style={{ background: "#f0f0f0", borderRadius: "6px", height: "8px", marginBottom: "8px" }}>
                      <div style={{
                        background: isOver ? "#e53935" : "#2d6a4f",
                        borderRadius: "6px", height: "8px",
                        width: `${Math.min((c.your_spending / Math.max(c.your_spending, c.peer_avg)) * 100, 100)}%`,
                      }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#888", marginBottom: "4px" }}>
                      <span>Peer Avg</span>
                      <span>${c.peer_avg.toFixed(2)}</span>
                    </div>
                    <div style={{ background: "#f0f0f0", borderRadius: "6px", height: "8px" }}>
                      <div style={{
                        background: "#4ECDC4",
                        borderRadius: "6px", height: "8px",
                        width: `${Math.min((c.peer_avg / Math.max(c.your_spending, c.peer_avg)) * 100, 100)}%`,
                      }} />
                    </div>
                  </div>

                  {/* Comparison text */}
                  <p style={{ margin: "8px 0 0", fontSize: "13px", color: "#666", fontStyle: "italic" }}>
                    {c.comparison_text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
