import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Users, FileText, Trash2, ArrowLeft, LogIn, Calendar, Shield, RefreshCw, X } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function authHeader() {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

function formatDate(dateStr) {
    if (!dateStr) return "Never";
    const d = new Date(dateStr);
    return d.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function wordCount(content) {
    if (!content) return 0;
    return content.trim().split(/\s+/).filter(Boolean).length;
}

function getInitials(name) {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

// ─── Confirm dialog ───────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel }) {
    return (
        <div style={styles.overlay}>
            <div style={styles.dialog}>
                <p style={{ color: "#e8e8e8", margin: "0 0 24px", fontSize: 15 }}>{message}</p>
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button style={styles.btnGhost} onClick={onCancel}>Cancel</button>
                    <button style={styles.btnDanger} onClick={onConfirm}>Delete</button>
                </div>
            </div>
        </div>
    );
}

// ─── Note preview panel ───────────────────────────────────────────
function NotePreview({ note, onClose }) {
    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.notePreviewPanel} onClick={(e) => e.stopPropagation()}>
                <div style={styles.previewHeader}>
                    <h3 style={styles.previewTitle}>{note.title}</h3>
                    <button onClick={onClose} style={styles.iconBtn}><X size={18} /></button>
                </div>
                <div style={styles.previewMeta}>
                    <span>{formatDate(note.updatedAt)}</span>
                    <span>{wordCount(note.content)} words</span>
                </div>
                <div style={styles.previewContent}>
                    {note.content ? (
                        <pre style={styles.previewPre}>{note.content.slice(0, 3000)}{note.content.length > 3000 ? "\n\n..." : ""}</pre>
                    ) : (
                        <p style={{ color: "#555", fontStyle: "italic" }}>This note has no content.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Main AdminDashboard ──────────────────────────────────────────
export default function AdminDashboard() {
    const { isAuthenticated, authLoading, isAdmin, userMeta } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("users"); // "users" | "notes"
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userNotes, setUserNotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedNote, setSelectedNote] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null); // userId to delete

    // Auth guard
    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated) navigate("/login", { replace: true });
            else if (!isAdmin) navigate("/app", { replace: true });
        }
    }, [authLoading, isAuthenticated, isAdmin]);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API}/api/admin/users`, { headers: authHeader() });
            if (!res.ok) throw new Error("Failed to load users");
            const data = await res.json();
            setUsers(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchUserNotes = useCallback(async (user) => {
        setSelectedUser(user);
        setActiveTab("notes");
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API}/api/admin/users/${user._id}/notes`, { headers: authHeader() });
            if (!res.ok) throw new Error("Failed to load notes");
            const data = await res.json();
            setUserNotes(data.notes);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteUser = useCallback(async (userId) => {
        try {
            const res = await fetch(`${API}/api/admin/users/${userId}`, {
                method: "DELETE",
                headers: authHeader(),
            });
            if (!res.ok) throw new Error("Delete failed");
            setUsers((prev) => prev.filter((u) => u._id !== userId));
            setConfirmDelete(null);
            if (selectedUser && selectedUser._id === userId) {
                setSelectedUser(null);
                setActiveTab("users");
            }
        } catch (e) {
            setError(e.message);
            setConfirmDelete(null);
        }
    }, [selectedUser]);

    useEffect(() => {
        if (!authLoading && isAuthenticated && isAdmin) fetchUsers();
    }, [authLoading, isAuthenticated, isAdmin]);

    if (authLoading || !isAuthenticated || !isAdmin) return null;

    return (
        <div style={styles.root}>
            <style>{animationCSS}</style>

            {/* Header */}
            <header style={styles.header}>
                <div style={styles.headerLeft}>
                    <Shield size={20} style={{ color: "#a78bfa" }} />
                    <span style={styles.logo}>QuillSpace <span style={styles.adminBadge}>Admin</span></span>
                </div>
                <div style={styles.headerRight}>
                    <span style={styles.adminUser}>{userMeta?.name || "Admin"}</span>
                    <button style={styles.btnGhost} onClick={() => navigate("/app")}>← Back to App</button>
                </div>
            </header>

            <div style={styles.body}>
                {/* Sidebar tabs */}
                <nav style={styles.nav}>
                    <button
                        style={{ ...styles.navItem, ...(activeTab === "users" ? styles.navItemActive : {}) }}
                        onClick={() => { setActiveTab("users"); setSelectedUser(null); }}
                    >
                        <Users size={16} /> All Users
                        <span style={styles.badge}>{users.length}</span>
                    </button>
                    {selectedUser && (
                        <button
                            style={{ ...styles.navItem, ...(activeTab === "notes" ? styles.navItemActive : {}) }}
                            onClick={() => setActiveTab("notes")}
                        >
                            <FileText size={16} />
                            <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {selectedUser.name}
                            </span>
                            <span style={styles.badge}>{userNotes.length}</span>
                        </button>
                    )}
                </nav>

                {/* Main panel */}
                <main style={styles.main}>

                    {/* ── Users Tab ── */}
                    {activeTab === "users" && (
                        <div style={styles.fadeIn}>
                            <div style={styles.panelHeader}>
                                <h2 style={styles.panelTitle}>All Users</h2>
                                <button style={styles.btnIcon} onClick={fetchUsers} title="Refresh">
                                    <RefreshCw size={15} />
                                </button>
                            </div>

                            {loading && <div style={styles.centered}><div style={styles.spinner} /></div>}
                            {error && <div style={styles.errorBox}>{error}</div>}
                            {!loading && !error && users.length === 0 && (
                                <p style={styles.emptyMsg}>No users found.</p>
                            )}

                            {!loading && users.length > 0 && (
                                <div style={styles.tableWrapper}>
                                    <table style={styles.table}>
                                        <thead>
                                            <tr>
                                                {["User", "Email", "Auth", "Notes", "Registered", "Last Login", ""].map((h) => (
                                                    <th key={h} style={styles.th}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((u) => (
                                                <tr
                                                    key={u._id}
                                                    style={styles.tr}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                                >
                                                    <td style={styles.td}>
                                                        <div style={styles.userCell}>
                                                            <div style={{ ...styles.avatar, background: u.isAdmin ? "linear-gradient(135deg,#a78bfa,#7c3aed)" : "linear-gradient(135deg,#3b82f6,#1d4ed8)" }}>
                                                                {u.picture
                                                                    ? <img src={u.picture} alt={u.name} style={styles.avatarImg} />
                                                                    : getInitials(u.name)
                                                                }
                                                            </div>
                                                            <div>
                                                                <span style={styles.userName}>{u.name}</span>
                                                                {u.isAdmin && <span style={styles.adminTag}>admin</span>}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ ...styles.td, color: "#888", fontSize: 13 }}>{u.email}</td>
                                                    <td style={styles.td}>
                                                        <span style={{ ...styles.providerBadge, ...(u.authProvider === "google" ? styles.googleBadge : styles.localBadge) }}>
                                                            {u.authProvider}
                                                        </span>
                                                    </td>
                                                    <td style={{ ...styles.td, textAlign: "center" }}>
                                                        <button
                                                            style={styles.noteCountBtn}
                                                            onClick={() => fetchUserNotes(u)}
                                                            title="View notes"
                                                        >
                                                            <FileText size={13} /> {u.noteCount}
                                                        </button>
                                                    </td>
                                                    <td style={{ ...styles.td, color: "#666", fontSize: 12 }}>
                                                        <Calendar size={11} style={{ marginRight: 4, verticalAlign: "middle" }} />
                                                        {formatDate(u.createdAt)}
                                                    </td>
                                                    <td style={{ ...styles.td, color: "#666", fontSize: 12 }}>
                                                        <LogIn size={11} style={{ marginRight: 4, verticalAlign: "middle" }} />
                                                        {formatDate(u.lastLoginAt)}
                                                    </td>
                                                    <td style={styles.td}>
                                                        {!u.isAdmin && (
                                                            <button
                                                                style={styles.deleteBtn}
                                                                onClick={() => setConfirmDelete(u)}
                                                                title="Delete user"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Notes Tab ── */}
                    {activeTab === "notes" && selectedUser && (
                        <div style={styles.fadeIn}>
                            <div style={styles.panelHeader}>
                                <button style={styles.backBtn} onClick={() => { setActiveTab("users"); setSelectedUser(null); }}>
                                    <ArrowLeft size={15} /> Users
                                </button>
                                <h2 style={styles.panelTitle}>{selectedUser.name}'s Notes</h2>
                            </div>

                            {loading && <div style={styles.centered}><div style={styles.spinner} /></div>}
                            {error && <div style={styles.errorBox}>{error}</div>}
                            {!loading && userNotes.length === 0 && (
                                <p style={styles.emptyMsg}>This user has no notes.</p>
                            )}

                            {!loading && userNotes.length > 0 && (
                                <div style={styles.notesGrid}>
                                    {userNotes.map((note) => (
                                        <div
                                            key={note._id}
                                            style={styles.noteCard}
                                            onClick={() => setSelectedNote(note)}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.borderColor = "rgba(167,139,250,0.4)";
                                                e.currentTarget.style.transform = "translateY(-2px)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                                                e.currentTarget.style.transform = "translateY(0)";
                                            }}
                                        >
                                            <div style={styles.noteTitle}>{note.title}</div>
                                            <div style={styles.noteSnippet}>
                                                {note.content ? note.content.slice(0, 120) + (note.content.length > 120 ? "…" : "") : <em style={{ color: "#555" }}>Empty note</em>}
                                            </div>
                                            <div style={styles.noteMeta}>
                                                <span>{wordCount(note.content)} words</span>
                                                <span>{formatDate(note.updatedAt)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* Confirm Delete dialog */}
            {confirmDelete && (
                <ConfirmDialog
                    message={`Delete "${confirmDelete.name}" (${confirmDelete.email}) and all their data? This cannot be undone.`}
                    onConfirm={() => deleteUser(confirmDelete._id)}
                    onCancel={() => setConfirmDelete(null)}
                />
            )}

            {/* Note Preview modal */}
            {selectedNote && (
                <NotePreview note={selectedNote} onClose={() => setSelectedNote(null)} />
            )}
        </div>
    );
}

// ─── Animation CSS ────────────────────────────────────────────────
const animationCSS = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
`;

// ─── Styles ───────────────────────────────────────────────────────
const styles = {
    root: {
        height: "100vh",
        width: "100%",
        background: "#0e0e0e",
        color: "#e8e8e8",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Inter', -apple-system, sans-serif",
        overflow: "hidden",
    },
    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        height: 56,
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(255,255,255,0.02)",
        flexShrink: 0,
    },
    headerLeft: { display: "flex", alignItems: "center", gap: 10 },
    logo: { fontSize: 16, fontWeight: 600, color: "#e8e8e8" },
    adminBadge: {
        background: "linear-gradient(90deg,#a78bfa,#7c3aed)",
        padding: "2px 8px",
        borderRadius: 6,
        fontSize: 11,
        color: "#fff",
        fontWeight: 600,
        marginLeft: 6,
        letterSpacing: "0.05em",
    },
    headerRight: { display: "flex", alignItems: "center", gap: 16 },
    adminUser: { fontSize: 13, color: "#888" },
    body: { display: "flex", flex: 1, overflow: "hidden" },
    nav: {
        width: 200,
        borderRight: "1px solid rgba(255,255,255,0.07)",
        padding: "16px 8px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        flexShrink: 0,
    },
    navItem: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "9px 12px",
        borderRadius: 8,
        background: "transparent",
        border: "none",
        color: "#888",
        fontSize: 13,
        cursor: "pointer",
        textAlign: "left",
        transition: "background 0.15s, color 0.15s",
        width: "100%",
    },
    navItemActive: {
        background: "rgba(167,139,250,0.1)",
        color: "#a78bfa",
    },
    badge: {
        marginLeft: "auto",
        background: "rgba(255,255,255,0.08)",
        color: "#888",
        fontSize: 11,
        padding: "1px 7px",
        borderRadius: 10,
        minWidth: 20,
        textAlign: "center",
    },
    main: { flex: 1, overflow: "auto", padding: 28 },
    fadeIn: { animation: "fadeIn 0.25s ease" },
    panelHeader: { display: "flex", alignItems: "center", gap: 12, marginBottom: 20 },
    panelTitle: { fontSize: 18, fontWeight: 600, margin: 0, color: "#e8e8e8" },
    btnIcon: {
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 8,
        color: "#888",
        padding: "6px 8px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
    },
    backBtn: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "transparent",
        border: "none",
        color: "#888",
        fontSize: 13,
        cursor: "pointer",
        padding: "6px 10px",
        borderRadius: 7,
        transition: "color 0.15s",
    },
    tableWrapper: { overflowX: "auto", borderRadius: 12, border: "1px solid rgba(255,255,255,0.07)" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: {
        padding: "10px 14px",
        textAlign: "left",
        fontSize: 11,
        color: "#555",
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(255,255,255,0.02)",
    },
    tr: { transition: "background 0.15s", cursor: "default" },
    td: { padding: "13px 14px", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 14, verticalAlign: "middle" },
    userCell: { display: "flex", alignItems: "center", gap: 10 },
    avatar: {
        width: 34,
        height: 34,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        fontWeight: 700,
        color: "#fff",
        flexShrink: 0,
        overflow: "hidden",
    },
    avatarImg: { width: "100%", height: "100%", objectFit: "cover" },
    userName: { fontSize: 14, fontWeight: 500, color: "#e0e0e0" },
    adminTag: {
        display: "inline-block",
        background: "rgba(167,139,250,0.15)",
        color: "#a78bfa",
        fontSize: 10,
        padding: "1px 6px",
        borderRadius: 5,
        marginLeft: 6,
        fontWeight: 600,
        verticalAlign: "middle",
    },
    providerBadge: {
        padding: "2px 9px",
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.04em",
    },
    googleBadge: { background: "rgba(234,179,8,0.1)", color: "#fbbf24" },
    localBadge: { background: "rgba(59,130,246,0.1)", color: "#60a5fa" },
    noteCountBtn: {
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 7,
        color: "#aaa",
        padding: "4px 10px",
        fontSize: 13,
        cursor: "pointer",
        transition: "background 0.15s, color 0.15s",
    },
    deleteBtn: {
        background: "transparent",
        border: "none",
        color: "#444",
        cursor: "pointer",
        padding: "5px",
        borderRadius: 6,
        display: "flex",
        alignItems: "center",
        transition: "color 0.15s, background 0.15s",
    },
    emptyMsg: { color: "#555", fontSize: 14, marginTop: 40, textAlign: "center" },
    errorBox: {
        background: "rgba(239,68,68,0.08)",
        border: "1px solid rgba(239,68,68,0.2)",
        color: "#f87171",
        padding: "12px 16px",
        borderRadius: 8,
        fontSize: 13,
        marginBottom: 16,
    },
    centered: { display: "flex", justifyContent: "center", padding: 60 },
    spinner: {
        width: 28,
        height: 28,
        border: "3px solid rgba(255,255,255,0.08)",
        borderTopColor: "#a78bfa",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
    },
    notesGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 14,
    },
    noteCard: {
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 12,
        padding: 16,
        cursor: "pointer",
        transition: "border-color 0.2s, transform 0.2s",
    },
    noteTitle: { fontSize: 14, fontWeight: 600, color: "#e0e0e0", marginBottom: 8, lineHeight: 1.4 },
    noteSnippet: { fontSize: 12, color: "#666", lineHeight: 1.6, marginBottom: 12, minHeight: 40 },
    noteMeta: { display: "flex", justifyContent: "space-between", fontSize: 11, color: "#444" },
    // Overlay & dialogs
    overlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
    },
    dialog: {
        background: "#1a1a1a",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 14,
        padding: 28,
        maxWidth: 420,
        width: "90%",
    },
    notePreviewPanel: {
        background: "#141414",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 16,
        width: "min(700px, 90vw)",
        maxHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
    },
    previewHeader: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        padding: "20px 20px 12px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        gap: 12,
    },
    previewTitle: { fontSize: 17, fontWeight: 600, color: "#e8e8e8", margin: 0, lineHeight: 1.4 },
    previewMeta: {
        display: "flex",
        gap: 16,
        padding: "10px 20px",
        fontSize: 12,
        color: "#555",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
    },
    previewContent: { padding: "16px 20px", overflow: "auto", flex: 1 },
    previewPre: { margin: 0, color: "#bbb", fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: "inherit" },
    iconBtn: {
        background: "transparent",
        border: "none",
        color: "#555",
        cursor: "pointer",
        padding: 4,
        display: "flex",
        alignItems: "center",
        flexShrink: 0,
        borderRadius: 6,
        transition: "color 0.15s",
    },
    btnGhost: {
        background: "transparent",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 8,
        color: "#888",
        padding: "6px 14px",
        fontSize: 13,
        cursor: "pointer",
        transition: "background 0.15s, color 0.15s",
    },
    btnDanger: {
        background: "rgba(239,68,68,0.15)",
        border: "1px solid rgba(239,68,68,0.3)",
        borderRadius: 8,
        color: "#f87171",
        padding: "6px 14px",
        fontSize: 13,
        cursor: "pointer",
        fontWeight: 600,
    },
};
