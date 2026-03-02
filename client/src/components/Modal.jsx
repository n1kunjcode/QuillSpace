import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function Modal({ isOpen, onClose, title, children, actions }) {
    useEffect(() => {
        const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
        if (isOpen) window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div
            onClick={onClose}
            style={{
                position: "fixed", inset: 0, zIndex: 1000,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)",
                padding: 16,
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    width: "100%", maxWidth: 420,
                    background: "#161616",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 14,
                    boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    animation: "modalIn 0.18s ease",
                }}
            >
                <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.95) translateY(6px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>

                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#fff" }}>{title}</h3>
                    <button
                        onClick={onClose}
                        style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "2px 6px", borderRadius: 6, transition: "color 0.15s" }}
                        onMouseEnter={e => e.target.style.color = "#ccc"}
                        onMouseLeave={e => e.target.style.color = "#555"}
                    >✕</button>
                </div>

                {/* Body */}
                <div style={{ padding: "16px 20px", color: "#999" }}>
                    {children}
                </div>

                {/* Actions */}
                {actions && (
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "0 20px 16px" }}>
                        {actions}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
