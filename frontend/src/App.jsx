import { useState } from "react";
import Navbar from "./components/Navbar";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Insights from "./pages/Insights";
import Peers from "./pages/Peers";

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleLogin = (accessToken, userData) => {
    setToken(accessToken);
    setUser(userData);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setActiveTab("dashboard");
  };

  // Not logged in - show auth page
  if (!token) {
    return <AuthPage onLogin={handleLogin} />;
  }

  // Render active page
  const renderPage = () => {
    switch (activeTab) {
      case "dashboard":    return <Dashboard token={token} />;
      case "transactions": return <Transactions token={token} />;
      case "budgets":      return <Budgets token={token} />;
      case "insights":     return <Insights token={token} />;
      case "peers":        return <Peers token={token} user={user} />;
      default:             return <Dashboard token={token} />;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6f5" }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        user={user}
      />
      {renderPage()}
    </div>
  );
}
