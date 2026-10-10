import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
    const [bugs, setBugs] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [severity, setSeverity] = useState("Low");
    const [editingBugId, setEditingBugId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editSeverity, setEditSeverity] = useState("Low");
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/");
            return;
        }
        fetchBugs();
    }, []);

    async function fetchBugs() {
        const token = localStorage.getItem("token");
        const response = await fetch("http://127.0.0.1:5000/api/bugs", {
            headers: { "Authorization": "Bearer " + token }
        });

        if (response.ok) {
            const data = await response.json();
            setBugs(data);
        } else {
            navigate("/");
        }
    }

    async function handleAddBug(e) {
        e.preventDefault();
        const token = localStorage.getItem("token");

        await fetch("http://127.0.0.1:5000/api/bugs", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ title, description, severity })
        });

        setTitle("");
        setDescription("");
        setSeverity("Low");
        fetchBugs();
    }

    async function handleResolve(bugId) {
        const token = localStorage.getItem("token");
        await fetch(`http://127.0.0.1:5000/api/bugs/${bugId}`, {
            method: "PUT",
            headers: { "Authorization": "Bearer " + token }
        });
        fetchBugs();
    }

    async function handleDelete(bugId) {
        const token = localStorage.getItem("token");
        await fetch(`http://127.0.0.1:5000/api/bugs/${bugId}`, {
            method: "DELETE",
            headers: { "Authorization": "Bearer " + token }
        });
        fetchBugs();
    }

    function startEditing(bug) {
        setEditingBugId(bug.id);
        setEditTitle(bug.title);
        setEditDescription(bug.description);
        setEditSeverity(bug.severity);
    }

    async function handleSaveEdit(bugId) {
        const token = localStorage.getItem("token");
        await fetch(`http://127.0.0.1:5000/api/bugs/${bugId}/edit`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ title: editTitle, description: editDescription, severity: editSeverity })
        });
        setEditingBugId(null);
        fetchBugs();
    }

    function handleLogout() {
        localStorage.removeItem("token");
        navigate("/");
    }

    return (
        <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: "#F8FAFC", minHeight: "100vh" }}>
            {/* Top navbar */}
            <div className="app-nav" style={{
                backgroundColor: "#1E293B",
                padding: "16px 40px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "white", fontSize: "20px", fontWeight: "700" }}>
                    <span style={{
                        display: "inline-flex", width: "32px", height: "32px",
                        backgroundColor: "#F59E0B", borderRadius: "8px",
                        alignItems: "center", justifyContent: "center", fontSize: "16px"
                    }}>🐞</span>
                    BugTracker
                </div>
                <button onClick={handleLogout} style={{
                    backgroundColor: "transparent", color: "#94A3B8", border: "1px solid #334155",
                    padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "14px"
                }}>
                    Logout
                </button>
            </div>

            <div className="app-content" style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>

                {/* Add bug card */}
                <div style={{ backgroundColor: "white", borderRadius: "10px", padding: "24px", marginBottom: "30px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                    <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "18px", color: "#0F172A" }}>Add New Bug</h2>
                    <form onSubmit={handleAddBug}>
                        <input
                            type="text"
                            placeholder="Bug title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            style={{
                                display: "block", width: "100%", padding: "10px 12px",
                                marginBottom: "10px", border: "1.5px solid #E2E8F0",
                                borderRadius: "6px", fontSize: "14px", outline: "none"
                            }}
                        />
                        <textarea
                            placeholder="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            style={{
                                display: "block", width: "100%", padding: "10px 12px",
                                marginBottom: "10px", border: "1.5px solid #E2E8F0",
                                borderRadius: "6px", fontSize: "14px", outline: "none", resize: "none"
                            }}
                        />
                        <select
                            value={severity}
                            onChange={(e) => setSeverity(e.target.value)}
                            style={{
                                display: "block", width: "100%", padding: "10px 12px",
                                marginBottom: "14px", border: "1.5px solid #E2E8F0",
                                borderRadius: "6px", fontSize: "14px", outline: "none"
                            }}
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                        <button type="submit" style={{
                            padding: "10px 20px", backgroundColor: "#F59E0B",
                            color: "white", border: "none", borderRadius: "6px",
                            fontWeight: "600", cursor: "pointer", fontSize: "14px"
                        }}>
                            Add Bug
                        </button>
                    </form>
                </div>

                {/* Bugs list */}
                <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "#0F172A" }}>All Bugs</h2>

                {bugs.length === 0 && (
                    <p style={{ color: "#94A3B8", fontSize: "14px" }}>No bugs found. Add one above to get started.</p>
                )}

                {bugs.map(bug => {
                    const severityColor = bug.severity === "High" ? "#DC2626" : bug.severity === "Medium" ? "#D97706" : "#16A34A";

                    if (editingBugId === bug.id) {
                        // EDIT MODE
                        return (
                            <div key={bug.id} style={{
                                backgroundColor: "white", borderRadius: "10px", padding: "18px 20px",
                                marginBottom: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
                            }}>
                                <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748B", marginBottom: "4px", display: "block" }}>Title</label>
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    style={{ display: "block", width: "100%", padding: "8px", marginBottom: "12px", border: "1.5px solid #E2E8F0", borderRadius: "6px" }}
                                />

                                <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748B", marginBottom: "4px", display: "block" }}>Description</label>
                                <textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    style={{ display: "block", width: "100%", padding: "8px", marginBottom: "12px", border: "1.5px solid #E2E8F0", borderRadius: "6px", resize: "none" }}
                                />

                                <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748B", marginBottom: "4px", display: "block" }}>Severity</label>
                                <select
                                    value={editSeverity}
                                    onChange={(e) => setEditSeverity(e.target.value)}
                                    style={{ display: "block", width: "100%", padding: "8px", marginBottom: "14px", border: "1.5px solid #E2E8F0", borderRadius: "6px" }}
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>

                                <button onClick={() => handleSaveEdit(bug.id)} style={{ padding: "6px 14px", backgroundColor: "#16A34A", color: "white", border: "none", borderRadius: "6px", marginRight: "8px", cursor: "pointer" }}>Save</button>
                                <button onClick={() => setEditingBugId(null)} style={{ padding: "6px 14px", backgroundColor: "#E2E8F0", color: "#334155", border: "none", borderRadius: "6px", cursor: "pointer" }}>Cancel</button>
                            </div>
                        );
                    }

                    // NORMAL MODE
                    return (
                        <div key={bug.id} className="bug-card" style={{
                            backgroundColor: "white", borderRadius: "10px", padding: "18px 20px",
                            marginBottom: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                            display: "flex", justifyContent: "space-between", alignItems: "flex-start"
                        }}>
                            <div className="bug-info" style={{ flex: 1 }}>
                                <div className="bug-title-row" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                                    <h3 style={{ fontSize: "15px", fontWeight: "600", color: "#0F172A", margin: 0 }}>{bug.title}</h3>
                                    <span style={{
                                        fontSize: "11px", fontWeight: "700", color: severityColor,
                                        backgroundColor: severityColor + "20", padding: "2px 8px", borderRadius: "4px"
                                    }}>
                                        {bug.severity}
                                    </span>
                                    <span style={{
                                        fontSize: "11px", fontWeight: "600", color: bug.status === "resolved" ? "#16A34A" : "#64748B",
                                        textTransform: "capitalize"
                                    }}>
                                        {bug.status}
                                    </span>
                                </div>
                                <p style={{ fontSize: "13px", color: "#64748B", margin: 0 }}>{bug.description}</p>
                            </div>
                            <div className="bug-actions" style={{ display: "flex", gap: "8px", marginLeft: "16px" }}>
                                <button onClick={() => startEditing(bug)} style={{ padding: "6px 12px", fontSize: "12px", fontWeight: "600", backgroundColor: "#DBEAFE", color: "#2563EB", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleResolve(bug.id)}
                                    style={{
                                        padding: "6px 12px", fontSize: "12px", fontWeight: "600",
                                        backgroundColor: bug.status === "resolved" ? "#94A3B8" : "#16A34A",
                                        color: "white",
                                        border: "none", borderRadius: "6px",
                                        cursor: "pointer"
                                    }}
                                >
                                    {bug.status === "resolved" ? "Reopen" : "Resolve"}
                                </button>
                                <button
                                    onClick={() => handleDelete(bug.id)}
                                    style={{
                                        padding: "6px 12px", fontSize: "12px", fontWeight: "600",
                                        backgroundColor: "#FEE2E2", color: "#DC2626",
                                        border: "none", borderRadius: "6px", cursor: "pointer"
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Dashboard;
