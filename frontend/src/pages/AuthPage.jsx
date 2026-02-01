import { useState } from "react";
import { api } from "../api";
import { INCOME_RANGES } from "../constants";
import { styles } from "../styles";

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [incomeRange, setIncomeRange] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        await api.register({
          firstname,
          lastname,
          email,
          password,
          income_range: incomeRange || null,
          goals: {},
        });
      }
      const { access_token } = await api.login(email, password);
      const user = await api.getMe(access_token);
      onLogin(access_token, user);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #e8f5e9, #c8e6c9)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{ ...styles.card, width: "380px", padding: "40px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "52px" }}>[logo]</div>
          <h1 style={{ margin: "4px 0 0", color: "#2d6a4f", fontSize: "28px" }}>Bloom</h1>
          <p style={{ margin: "4px 0 0", color: "#888", fontSize: "14px" }}>Watch your savings bloom</p>
        </div>

        {/* Mode Toggle */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          {["login", "register"].map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                flex: 1,
                padding: "10px",
                border: "none",
                borderRadius: "10px",
                background: mode === m ? "#2d6a4f" : "#f0f0f0",
                color: mode === m ? "#fff" : "#666",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
                textTransform: "capitalize",
              }}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Form */}
        {mode === "register" && (
          <input
          style={{ ...styles.input, marginBottom: "10px" }}
          type="firstname"
          placeholder="First name"
          value={firstname}
          onChange={e => setFirstName(e.target.value)}
          />
        )}
        {mode === "register" && (
          <input
          style={{ ...styles.input, marginBottom: "10px" }}
          type="lastname"
          placeholder="Last name"
          value={lastname}
          onChange={e => setLastName(e.target.value)}
          />
        )}
        <input
          style={{ ...styles.input, marginBottom: "10px" }}
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          style={{ ...styles.input, marginBottom: "10px" }}
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {mode === "register" && (
          <select
            style={{ ...styles.input, marginBottom: "10px" }}
            value={incomeRange}
            onChange={e => setIncomeRange(e.target.value)}
          >
            <option value="">Income range (optional)</option>
            {INCOME_RANGES.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        ) }

        {/* Error */}
        {error && <p style={{ color: "#e53935", fontSize: "13px", margin: "0 0 10px" }}>{error}</p>}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ ...styles.btnPrimary, width: "100%", padding: "12px", fontSize: "15px", opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "..." : mode === "login" ? "Login" : "Create Account"}
        </button>
      </div>
    </div>
  );
}
