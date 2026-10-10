import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";


function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    async function handleLogin(e) {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
        setError("Username and password cannot be blank");
        return;  // yahin ruk jao, Flask ko request mat bhejo
    }

    try {
        const response = await fetch("https://bug-tracker-project-iota.vercel.app/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("token", data.access_token);
            navigate("/dashboard");
        } else {
            setError(data.error || "Login failed");
        }
    } catch (err) {
        setError("Could not connect to server");
    }
}
    return (
    <div className="auth-page" style={{ display: "flex", height: "100vh", fontFamily: "'Inter', sans-serif" }}>
        {/* Left branding panel */}
        <div className="auth-left" style={{
            flex: "50%",
            background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
            backgroundImage: `radial-gradient(circle, #334155 1px, transparent 1px), linear-gradient(135deg, #1E293B 0%, #0F172A 100%)`,
            backgroundSize: "24px 24px, cover",
            color: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            padding: "60px"
        }}>
            <div className="auth-logo" style={{
                fontSize: "48px", fontWeight: "700", marginBottom: "16px",
                display: "flex", alignItems: "center", gap: "10px"
            }}>
                <span style={{
                    display: "inline-flex", width: "36px", height: "36px",
                    backgroundColor: "#F59E0B", borderRadius: "8px",
                    alignItems: "center", justifyContent: "center", fontSize: "30px"
                }}>🐞</span>
                BugTracker
            </div>
            <h1 style={{ fontSize: "40px", fontWeight: "700", lineHeight: "1.2", maxWidth: "420px", marginBottom: "16px" }}>
                Ship with confidence.
            </h1>
            <p style={{ color: "#94A3B8", fontSize: "16px", maxWidth: "380px", lineHeight: "1.6" }}>
                Track, prioritize, and resolve issues before they reach production.
            </p>
        </div>

        {/* Right login form panel */}
        <div className="auth-right" style={{
            flex: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#FFFFFF"
        }}>
            <div className="auth-form-wrap" style={{ width: "340px" }}>
                <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "6px", color: "#0F172A" }}>Welcome back</h2>
                <p style={{ color: "#64748B", fontSize: "14px", marginBottom: "28px" }}>Log in to manage your bugs</p>
                <form onSubmit={handleLogin}>
                    <label style={{ fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px", display: "block" }}>
                        Username
                    </label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{
                            display: "block", width: "100%", padding: "11px 12px",
                            marginBottom: "18px", border: "1.5px solid #E2E8F0",
                            borderRadius: "8px", fontSize: "14px", outline: "none"
                        }}
                    />
                    <label style={{ fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px", display: "block" }}>
                        Password
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            display: "block", width: "100%", padding: "11px 12px",
                            marginBottom: "22px", border: "1.5px solid #E2E8F0",
                            borderRadius: "8px", fontSize: "14px", outline: "none"
                        }}
                    />
                    <button type="submit" style={{
                        width: "100%", padding: "12px", backgroundColor: "#F59E0B",
                        color: "white", border: "none", borderRadius: "8px",
                        fontWeight: "600", cursor: "pointer", fontSize: "14px"
                    }}>
                        Log in
                    </button>
                    {error && <p style={{ color: "#DC2626", marginTop: "12px", fontSize: "13px" }}>{error}</p>}
                </form>
                <p style={{ marginTop: "24px", fontSize: "14px", color: "#64748B" }}>
                    Don't have an account? <Link to="/register" style={{ color: "#F59E0B", fontWeight: "600", textDecoration: "none" }}>Register</Link>
                </p>
            </div>
        </div>
    </div>
);
}

export default LoginPage;
