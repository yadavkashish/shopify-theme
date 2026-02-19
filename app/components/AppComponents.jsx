
import React from "react";

// --- STYLES ---
const styles = {
    card: { background: "#fff", border: "1px solid #e1e3e5", borderRadius: "8px", padding: "20px", boxShadow: "0px 1px 3px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-start", minHeight: "160px" },
    cardText: { margin: "10px 0", color: "#666", fontSize: "14px", lineHeight: "1.5" },
    listItem: { background: "#fff", border: "1px solid #e1e3e5", borderRadius: "8px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "15px" },
    input: { width: "100%", padding: "10px 12px", border: "1px solid #8c9196", borderRadius: "4px", fontSize: "14px", outline: "none", marginTop: "4px", boxSizing: "border-box", fontFamily: "inherit" },
    label: { display: "block", marginBottom: "4px", fontWeight: "500", fontSize: "13px", color: "#303030" },
    addBtn: { textAlign: "center", padding: "15px", border: "1px dashed #babfc3", borderRadius: "4px", cursor: "pointer", backgroundColor: "#f9fafb", transition: "background 0.2s", marginTop: "10px" },
    toast: { position: "fixed", bottom: "30px", left: "50%", transform: "translateX(-50%)", background: "#202223", color: "white", padding: "10px 20px", borderRadius: "4px", zIndex: 1000, fontSize: "14px", fontWeight: "500", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" },
    productTag: { display: "inline-flex", alignItems: "center", gap: "4px", background: "#f4f6f8", border: "1px solid #e1e3e5", borderRadius: "4px", padding: "4px 8px", fontSize: "12px" },
    page: { maxWidth: "1000px", margin: "0 auto", padding: "20px", fontFamily: "-apple-system, BlinkMacSystemFont, 'San Francisco', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif" }
};

export const SPage = ({ children, heading, primaryAction }) => (
    <div style={styles.page}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#202223", margin: 0 }}>{heading}</h1>
            {primaryAction}
        </div>
        {children}
    </div>
);

export const SButton = ({ children, onClick, variant = "default", tone, loading, disabled, title }) => {
    let bg = "#fff", color = "#202223", border = "1px solid #babfc3";
    if (variant === "primary") { bg = tone === "critical" ? "#d82c0d" : "#008060"; color = "#fff"; border = "none"; }
    else if (variant === "plain") { bg = "transparent"; border = "none"; color = tone === "critical" ? "#d82c0d" : "#005bd3"; }
    return (
        <button onClick={onClick} disabled={loading || disabled} title={title} style={{ background: bg, color, border, padding: "8px 16px", borderRadius: "4px", cursor: (loading || disabled) ? "not-allowed" : "pointer", fontWeight: "500", fontSize: "14px", boxShadow: variant === "primary" ? "0 1px 0 rgba(0,0,0,0.05)" : "none", opacity: (loading || disabled) ? 0.7 : 1 }}>
            {loading ? "Processing..." : children}
        </button>
    );
};

export const SSection = ({ heading, children }) => (
    <div style={{ background: "#fff", borderRadius: "8px", border: "1px solid #e1e3e5", padding: "20px", marginBottom: "20px", boxShadow: "0 0 0 1px rgba(63, 63, 68, 0.05), 0 1px 3px 0 rgba(63, 63, 68, 0.15)" }}>
        {heading && <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "15px", marginTop: 0 }}>{heading}</h3>}
        {children}
    </div>
);

export const SStack = ({ children, direction = "row", gap = "10px" }) => <div style={{ display: "flex", flexDirection: direction === "block" ? "column" : "row", gap: gap === "large" ? "20px" : gap === "base" ? "10px" : "5px" }}>{children}</div>;
export const SHeading = ({ children }) => <h2 style={{ fontSize: "16px", fontWeight: "600", margin: 0, color: "#202223" }}>{children}</h2>;

export const SLabel = ({ children }) => <label style={styles.label}>{children}</label>;
export const SInput = (props) => <input style={styles.input} {...props} />;
export const STextArea = (props) => <textarea style={{ ...styles.input, resize: "vertical" }} {...props} />;
export const SToast = ({ message }) => message ? <div style={styles.toast}>{message}</div> : null;

export const SCard = ({ title, desc, actionLabel, onAction, variant = "default" }) => (
    <div style={styles.card}>
        <div>
            <SHeading>{title}</SHeading>
            <p style={styles.cardText}>{desc}</p>
        </div>
        <SButton variant={variant === "plain" ? "plain" : "default"} onClick={onAction}>{actionLabel}</SButton>
    </div>
);

export const SProductTag = ({ label, onRemove }) => (
    <span style={styles.productTag}>
        <span style={{ fontSize: "12px" }}>{label}</span>
        <button onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", color: "#d82c0d", fontSize: "14px", padding: "0 2px", lineHeight: 1 }} title="Remove">×</button>
    </span>
);

export const SAddButton = ({ onClick, label }) => (
    <div style={styles.addBtn} onClick={onClick}>
        <span style={{ fontWeight: "600", color: "#005bd3" }}>{label}</span>
    </div>
);

export const SListItem = ({ title, subtitle, actions, children }) => (
    <div style={{ ...styles.listItem, flexDirection: "column", alignItems: "stretch" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
                <h3 style={{ margin: "0 0 5px 0", fontSize: "16px", fontWeight: "600" }}>{title}</h3>
                <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>{subtitle}</p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
                {actions}
            </div>
        </div>
        {children}
    </div>
);
