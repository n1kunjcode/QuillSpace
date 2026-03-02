import { useEffect, useRef, useState } from "react";
import { useApp } from "../context/AppContext";
import api from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, FileText, Folder, X, Paperclip, ChevronDown, Check, ExternalLink, PanelRight } from "lucide-react";
import Modal from "./Modal";

// Attachment URLs are now full Cloudinary URLs stored in the attachment's path field

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@400;500;600&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');

  .editor-root {
    height: 100%;
    display: flex;
    flex-direction: row;
    position: relative;
    background: #0e0e0e;
    font-family: 'DM Sans', system-ui, sans-serif;
    overflow: hidden;
  }

  /* ── Left: writing pane ── */
  .editor-pane {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    height: 100%;
    overflow: hidden;
  }

  .editor-toolbar {
    padding: 10px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    background: rgba(14,14,14,0.9);
    backdrop-filter: blur(12px);
    flex-shrink: 0;
    min-height: 48px;
    position: relative;
    z-index: 10;
  }

  @media (max-width: 768px) {
    .editor-toolbar { padding: 10px 16px 10px 56px; }
  }

  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 0;
  }

  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }

  /* Folder dropdown */
  .folder-trigger {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 10px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px;
    color: #666;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, color 0.2s, border-color 0.2s;
    max-width: 180px;
  }
  .folder-trigger:hover { background: rgba(255,255,255,0.08); color: #ccc; border-color: rgba(255,255,255,0.14); }
  .folder-trigger-wrap { position: relative; }

  .folder-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    z-index: 100;
    min-width: 200px;
    background: #1a1a1a;
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.7);
    overflow: hidden;
    padding: 6px;
  }
  .folder-dropdown-bottom { top: auto; bottom: calc(100% + 4px); }
  .folder-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 9px 10px;
    border-radius: 7px;
    cursor: pointer;
    font-size: 13px;
    color: #888;
    font-family: 'DM Sans', sans-serif;
    transition: background 0.15s, color 0.15s;
    background: none;
    border: none;
    width: 100%;
    text-align: left;
  }
  .folder-option:hover { background: rgba(255,255,255,0.07); color: #fff; }
  .folder-option-inner { display: flex; align-items: center; gap: 8px; }
  .folder-divider { height: 1px; background: rgba(255,255,255,0.07); margin: 4px 0; }

  .toolbar-sep { color: #222; user-select: none; }
  .toolbar-meta { font-size: 11px; color: #333; white-space: nowrap; }

  /* Attachment toggle button in toolbar */
  .attach-toggle-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 10px;
    background: none;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px;
    color: #555;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, color 0.2s, border-color 0.2s;
    position: relative;
  }
  .attach-toggle-btn:hover { background: rgba(255,255,255,0.06); color: #ccc; border-color: rgba(255,255,255,0.15); }
  .attach-toggle-btn.active {
    background: rgba(245,158,11,0.1);
    color: #f59e0b;
    border-color: rgba(245,158,11,0.3);
  }
  .attach-count-badge {
    width: 16px; height: 16px;
    background: #f59e0b;
    color: #000;
    border-radius: 50%;
    font-size: 10px;
    font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    line-height: 1;
  }

  /* Saving indicator */
  .saving-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    display: inline-block;
    flex-shrink: 0;
  }
  .saving-label { font-size: 11px; color: #444; font-family: 'DM Sans', sans-serif; }

  .delete-btn {
    padding: 7px;
    background: none;
    border: none;
    border-radius: 8px;
    color: #333;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: color 0.2s, background 0.2s;
  }
  .delete-btn:hover { color: #f87171; background: rgba(248,113,113,0.1); }

  /* Writing area */
  .editor-scroll {
    flex: 1;
    overflow-y: auto;
    position: relative;
  }
  .editor-scroll::-webkit-scrollbar { width: 4px; }
  .editor-scroll::-webkit-scrollbar-track { background: transparent; }
  .editor-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); border-radius: 4px; }

  .editor-content {
    max-width: 680px;
    margin: 0 auto;
    padding: 48px 40px 80px;
  }
  @media (max-width: 768px) {
    .editor-content { padding: 32px 20px 60px; }
  }

  .editor-title {
    width: 100%;
    background: transparent;
    border: none;
    outline: none;
    resize: none;
    overflow: hidden;
    font-family: 'Playfair Display', serif;
    font-size: clamp(26px, 4vw, 40px);
    font-weight: 700;
    color: #fff;
    line-height: 1.2;
    letter-spacing: -0.02em;
    display: block;
  }
  .editor-title::placeholder { color: #222; }

  .editor-divider {
    width: 36px;
    height: 2px;
    background: rgba(245,158,11,0.3);
    border-radius: 2px;
    margin: 18px 0 26px;
  }

  .editor-body {
    width: 100%;
    background: transparent;
    border: none;
    outline: none;
    resize: none;
    font-family: 'Lora', Georgia, serif;
    font-size: 17px;
    color: #aaa;
    line-height: 1.9;
    letter-spacing: 0.01em;
    min-height: 60vh;
  }
  @media (max-width: 768px) {
    .editor-body { font-size: 16px; }
  }
  .editor-body::placeholder { color: #2a2a2a; }

  .wordcount {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 11px;
    color: #2a2a2a;
    margin-top: 24px;
    justify-content: flex-end;
    font-family: 'DM Sans', sans-serif;
    user-select: none;
  }

  /* ── Attachment Panel (right side, overlays editor) ── */
  .attach-panel {
    width: 280px;
    flex-shrink: 0;
    height: 100%;
    border-left: 1px solid rgba(255,255,255,0.07);
    background: #111;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  @media (max-width: 900px) {
    .attach-panel {
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      z-index: 30;
      box-shadow: -20px 0 60px rgba(0,0,0,0.5);
    }
  }
  @media (max-width: 480px) {
    .attach-panel { width: 100%; }
  }

  .attach-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    flex-shrink: 0;
  }
  .attach-panel-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 600;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-family: 'DM Sans', sans-serif;
  }
  .attach-panel-close {
    background: none;
    border: none;
    color: #444;
    cursor: pointer;
    padding: 4px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    transition: color 0.2s, background 0.2s;
  }
  .attach-panel-close:hover { color: #ccc; background: rgba(255,255,255,0.07); }

  .attach-panel-body {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
  }
  .attach-panel-body::-webkit-scrollbar { width: 3px; }
  .attach-panel-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); border-radius: 3px; }

  .attach-upload-btn {
    width: 100%;
    padding: 10px;
    background: rgba(245,158,11,0.08);
    border: 1px dashed rgba(245,158,11,0.25);
    border-radius: 10px;
    color: #f59e0b;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-bottom: 12px;
  }
  .attach-upload-btn:hover { background: rgba(245,158,11,0.13); border-color: rgba(245,158,11,0.4); }

  .attach-empty-panel {
    text-align: center;
    padding: 32px 16px;
    color: #2a2a2a;
    font-size: 12px;
    font-family: 'DM Sans', sans-serif;
  }

  .attach-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 9px;
    cursor: pointer;
    border: 1px solid rgba(255,255,255,0.06);
    background: rgba(255,255,255,0.02);
    margin-bottom: 6px;
    transition: background 0.15s, border-color 0.15s;
    position: relative;
    group: true;
  }
  .attach-item:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.12); }
  .attach-item.previewing {
    background: rgba(245,158,11,0.08);
    border-color: rgba(245,158,11,0.3);
  }

  .attach-item-thumb {
    width: 40px;
    height: 40px;
    border-radius: 7px;
    overflow: hidden;
    background: rgba(255,255,255,0.04);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .attach-item-thumb img { width: 100%; height: 100%; object-fit: cover; }

  .attach-item-info {
    flex: 1;
    min-width: 0;
  }
  .attach-item-name {
    font-size: 12px;
    font-weight: 500;
    color: #aaa;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: 'DM Sans', sans-serif;
  }
  .attach-item-type {
    font-size: 10px;
    color: #333;
    margin-top: 2px;
    font-family: 'DM Sans', sans-serif;
    text-transform: uppercase;
  }

  .attach-item-actions {
    display: flex;
    gap: 2px;
    opacity: 0;
    transition: opacity 0.15s;
    flex-shrink: 0;
  }
  .attach-item:hover .attach-item-actions { opacity: 1; }
  .attach-action-btn {
    background: none;
    border: none;
    color: #444;
    cursor: pointer;
    padding: 4px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    transition: color 0.15s, background 0.15s;
  }
  .attach-action-btn:hover { color: #ccc; background: rgba(255,255,255,0.08); }
  .attach-action-btn.danger:hover { color: #f87171; background: rgba(248,113,113,0.1); }

  /* ── Split view: attachment preview ── */
  .split-preview {
    width: 45%;
    flex-shrink: 0;
    height: 100%;
    border-left: 1px solid rgba(255,255,255,0.07);
    background: #0a0a0a;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  @media (max-width: 900px) {
    .split-preview { width: 50%; }
  }
  @media (max-width: 600px) {
    .split-preview {
      position: absolute;
      inset: 0;
      width: 100%;
      z-index: 40;
    }
  }

  .split-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    flex-shrink: 0;
    background: rgba(10,10,10,0.9);
  }
  .split-header-name {
    font-size: 12px;
    font-weight: 500;
    color: #666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: 'DM Sans', sans-serif;
    flex: 1;
    min-width: 0;
    margin-right: 8px;
  }
  .split-header-btns {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }
  .split-btn {
    background: none;
    border: none;
    color: #444;
    cursor: pointer;
    padding: 6px;
    border-radius: 7px;
    display: flex;
    align-items: center;
    transition: color 0.2s, background 0.2s;
  }
  .split-btn:hover { color: #ccc; background: rgba(255,255,255,0.07); }

  .split-body {
    flex: 1;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .split-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    padding: 16px;
  }
  .split-pdf {
    width: 100%;
    height: 100%;
    border: none;
  }
  .split-unknown {
    text-align: center;
    color: #333;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
  }

  /* Drag overlay */
  .drag-overlay {
    position: absolute;
    inset: 0;
    z-index: 50;
    background: rgba(245,158,11,0.06);
    border: 2px dashed rgba(245,158,11,0.4);
    border-radius: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }
  .drag-label {
    text-align: center;
    color: #f59e0b;
    font-family: 'DM Sans', sans-serif;
  }

  /* Empty state */
  .editor-empty {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0e0e0e;
    position: relative;
    overflow: hidden;
  }
  .editor-empty-watermark {
    position: absolute;
    font-size: 260px;
    color: rgba(255,255,255,0.012);
    pointer-events: none;
    user-select: none;
    line-height: 1;
  }
  .editor-empty-title {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 700;
    color: #2a2a2a;
    margin-bottom: 8px;
    letter-spacing: -0.01em;
    text-align: center;
  }
  .editor-empty-sub {
    font-size: 13px;
    color: #1f1f1f;
    font-family: 'DM Sans', sans-serif;
    text-align: center;
  }

  .modal-body-text { font-size: 14px; color: #ccc; font-family: 'DM Sans', sans-serif; }

  @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.35} }
`;

// ─── FolderDropdown ─────────────────────────────────────────────
function FolderDropdown({ folders, activeNote, onMove }) {
  const [open, setOpen] = useState(false);
  const [opensUp, setOpensUp] = useState(false);
  const ref = useRef(null);
  const btnRef = useRef(null);
  const currentFolder = folders.find(f => f._id === activeNote?.folderId);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleOpen = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const estHeight = (folders.length + 2) * 38 + 20;
      setOpensUp(window.innerHeight - rect.bottom < estHeight && rect.top > estHeight);
    }
    setOpen(o => !o);
  };

  return (
    <div className="folder-trigger-wrap" ref={ref}>
      <button ref={btnRef} className="folder-trigger" onClick={handleOpen}>
        <Folder size={12} style={{ color: currentFolder ? "#f59e0b" : "#444", flexShrink: 0 }} />
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {currentFolder?.name || "Loose Notes"}
        </span>
        <ChevronDown size={11} style={{ opacity: 0.5, flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className={`folder-dropdown${opensUp ? " folder-dropdown-bottom" : ""}`}
            initial={{ opacity: 0, y: opensUp ? 6 : -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: opensUp ? 6 : -6, scale: 0.97 }}
            transition={{ duration: 0.14 }}
          >
            <button className="folder-option" onClick={() => { onMove(null); setOpen(false); }}>
              <span className="folder-option-inner"><FileText size={13} style={{ color: "#444" }} /> Loose Notes</span>
              {!activeNote?.folderId && <Check size={12} style={{ color: "#f59e0b" }} />}
            </button>
            {folders.length > 0 && <>
              <div className="folder-divider" />
              {folders.map(f => (
                <button key={f._id} className="folder-option" onClick={() => { onMove(f._id); setOpen(false); }}>
                  <span className="folder-option-inner">
                    <Folder size={13} style={{ color: "#444" }} />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>{f.name}</span>
                  </span>
                  {activeNote?.folderId === f._id && <Check size={12} style={{ color: "#f59e0b" }} />}
                </button>
              ))}
            </>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── AttachmentPanel ─────────────────────────────────────────────
function AttachmentPanel({ note, onClose, onPreview, previewingFile, onDelete, onUpload }) {
  const attachments = note?.attachments || [];

  return (
    <motion.div
      className="attach-panel"
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 280, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 260 }}
    >
      <div className="attach-panel-header">
        <div className="attach-panel-title">
          <Paperclip size={12} />
          Attachments
          {attachments.length > 0 && (
            <span style={{ color: "#444", fontWeight: 400 }}>({attachments.length})</span>
          )}
        </div>
        <button className="attach-panel-close" onClick={onClose}><X size={14} /></button>
      </div>

      <div className="attach-panel-body">
        {/* Upload button */}
        <label className="attach-upload-btn">
          <Paperclip size={13} />
          Attach file
          <input
            type="file"
            style={{ display: "none" }}
            accept="image/*,application/pdf"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) await onUpload(file);
              e.target.value = "";
            }}
          />
        </label>

        {attachments.length === 0 ? (
          <div className="attach-empty-panel">
            <Paperclip size={20} style={{ margin: "0 auto 8px", display: "block", opacity: 0.2 }} />
            No attachments yet.<br />Drop files into the editor or click above.
          </div>
        ) : (
          attachments.map((file, idx) => {
            const isPreviewing = previewingFile?.filename === file.filename;
            const ext = file.originalName?.split(".").pop()?.toUpperCase() || "FILE";
            return (
              <div
                key={idx}
                className={`attach-item${isPreviewing ? " previewing" : ""}`}
                onClick={() => onPreview(isPreviewing ? null : file)}
              >
                <div className="attach-item-thumb">
                  {file.mimetype?.startsWith("image/") ? (
                    <img src={file.path} alt={file.originalName} />
                  ) : (
                    <FileText size={18} style={{ color: "#444" }} />
                  )}
                </div>
                <div className="attach-item-info">
                  <div className="attach-item-name">{file.originalName}</div>
                  <div className="attach-item-type">{ext}</div>
                </div>
                <div className="attach-item-actions">
                  <a
                    href={file.path}
                    target="_blank"
                    rel="noreferrer"
                    className="attach-action-btn"
                    onClick={e => e.stopPropagation()}
                    title="Open in new tab"
                  >
                    <ExternalLink size={12} />
                  </a>
                  <button
                    className="attach-action-btn danger"
                    onClick={e => { e.stopPropagation(); onDelete(idx); }}
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}

// ─── SplitPreview ─────────────────────────────────────────────────
function SplitPreview({ file, onClose }) {
  return (
    <motion.div
      className="split-preview"
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: "45%", opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 260 }}
    >
      <div className="split-header">
        <span className="split-header-name">{file.originalName}</span>
        <div className="split-header-btns">
          <a
            href={file.path}
            target="_blank"
            rel="noreferrer"
            className="split-btn"
            title="Open in new tab"
          >
            <ExternalLink size={14} />
          </a>
          <button className="split-btn" onClick={onClose} title="Close preview">
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="split-body">
        {file.mimetype?.startsWith("image/") ? (
          <img
            src={file.path}
            alt={file.originalName}
            className="split-image"
          />
        ) : file.mimetype === "application/pdf" ? (
          <iframe
            src={file.path}
            className="split-pdf"
            title={file.originalName}
          />
        ) : (
          <div className="split-unknown">
            <FileText size={32} style={{ margin: "0 auto 12px", display: "block", color: "#333" }} />
            <p>Preview not available</p>
            <a href={file.path} target="_blank" rel="noreferrer"
              style={{ color: "#f59e0b", fontSize: 12, marginTop: 8, display: "inline-block" }}>
              Open file ↗
            </a>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── SavingIndicator ──────────────────────────────────────────────
function SavingIndicator({ isSaving, visible }) {
  if (!visible) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span
        className="saving-dot"
        style={{
          background: isSaving ? "#f59e0b" : "#22c55e",
          animation: isSaving ? "pulse-dot 1s infinite" : "none",
        }}
      />
      <span className="saving-label">{isSaving ? "Saving" : "Saved"}</span>
    </div>
  );
}

// ─── Main Editor ─────────────────────────────────────────────────
export default function Editor() {
  const {
    activeNote, setActiveNote,
    editorMode, setEditorMode,
    activeFolder, setActiveFolder,
    notes, setNotes,
    folders,
    refreshData,
    attachPanelOpen, setAttachPanelOpen,
    splitAttachment, setSplitAttachment,
  } = useApp();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const saveTimeout = useRef(null);
  const isCreating = useRef(false);
  const titleRef = useRef(null);

  useEffect(() => {
    if (editorMode === "new") {
      setTitle(""); setContent(""); setHasSaved(false); isCreating.current = false;
    }
    if (editorMode === "existing" && activeNote) {
      setTitle(activeNote.title || ""); setContent(activeNote.content || ""); setHasSaved(true);
      if (activeNote.folderId) {
        const f = folders.find(f => f._id === activeNote.folderId);
        if (f) setActiveFolder(f);
      } else setActiveFolder(null);
    }
  }, [editorMode, activeNote?._id]);

  // Auto-resize title textarea
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = "auto";
      titleRef.current.style.height = titleRef.current.scrollHeight + "px";
    }
  }, [title]);

  const createNote = async (newTitle) => {
    if (isCreating.current) return;
    isCreating.current = true;
    try {
      const res = await api.post("/notes", { title: newTitle, content: "", folderId: activeFolder?._id || null });
      setActiveNote(res.data); setEditorMode("existing");
      setNotes(prev => [res.data, ...prev]); setHasSaved(true); refreshData();
    } catch (err) { console.error(err); isCreating.current = false; }
  };

  const scheduleSave = (t, c) => {
    if (!activeNote) return;
    setIsSaving(true);
    clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      try {
        const res = await api.patch(`/notes/${activeNote._id}`, { title: t, content: c });
        setActiveNote(res.data);
        setNotes(prev => prev.map(n => n._id === activeNote._id ? res.data : n));
        setIsSaving(false);
      } catch (err) { console.error(err); setIsSaving(false); }
    }, 800);
  };

  const handleTitleChange = (e) => {
    const v = e.target.value; setTitle(v);
    if (editorMode === "new" && v.trim()) { createNote(v); return; }
    if (editorMode === "existing") scheduleSave(v, content);
  };

  const handleContentChange = (e) => {
    const v = e.target.value; setContent(v);
    if (editorMode === "existing") scheduleSave(title, v);
  };

  const handleContentKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const s = e.target.selectionStart, end = e.target.selectionEnd;
      const v = content.substring(0, s) + "  " + content.substring(end);
      setContent(v);
      requestAnimationFrame(() => { e.target.selectionStart = e.target.selectionEnd = s + 2; });
    }
  };

  const handleMoveNote = async (newFolderId) => {
    if (!activeNote) return;
    try {
      const res = await api.patch(`/notes/${activeNote._id}`, { folderId: newFolderId });
      setActiveFolder(newFolderId ? folders.find(f => f._id === newFolderId) : null);
      setActiveNote(res.data);
      setNotes(prev => prev.map(n => n._id === activeNote._id ? res.data : n));
      refreshData();
    } catch (err) { console.error(err); }
  };

  const handleDeleteNote = async () => {
    if (!activeNote) return;
    try {
      await api.delete(`/notes/${activeNote._id}`);
      setNotes(prev => prev.filter(n => n._id !== activeNote._id));
      refreshData(); setActiveNote(null); setActiveFolder(null);
      setEditorMode("new"); setIsDeleteModalOpen(false);
    } catch (err) { console.error(err); }
  };

  const handleDeleteAttachment = async (idx) => {
    if (!activeNote) return;
    const idxToDelete = idx ?? attachmentToDelete;
    if (idxToDelete === null || idxToDelete === undefined) return;
    try {
      const updated = activeNote.attachments.filter((_, i) => i !== idxToDelete);
      const res = await api.patch(`/notes/${activeNote._id}`, { attachments: updated });
      setActiveNote(res.data);
      setNotes(prev => prev.map(n => n._id === activeNote._id ? res.data : n));
      setAttachmentToDelete(null);
      // If we deleted the currently previewed file, close split view
      if (splitAttachment) {
        const stillExists = res.data.attachments?.some(a => a.filename === splitAttachment.filename);
        if (!stillExists) setSplitAttachment(null);
      }
    } catch (err) { console.error(err); }
  };

  const uploadFile = async (file) => {
    const fd = new FormData(); fd.append("file", file);
    try {
      const up = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      const att = {
        originalName: up.data.originalName, filename: up.data.filename,
        path: up.data.path, mimetype: up.data.mimetype,
        size: up.data.size, createdAt: new Date()
      };
      const updated = [...(activeNote.attachments || []), att];
      const res = await api.patch(`/notes/${activeNote._id}`, { attachments: updated });
      setActiveNote(res.data);
      setNotes(prev => prev.map(n => n._id === activeNote._id ? res.data : n));
    } catch (err) { console.error(err); alert("Upload failed."); }
  };

  const handleDrop = async (e) => {
    e.preventDefault(); setIsDragging(false);
    if (!activeNote) return;
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith("image/") || file.type === "application/pdf")) {
      await uploadFile(file);
      setAttachPanelOpen(true);
    }
  };

  const handlePreview = (file) => {
    setSplitAttachment(file);
  };

  const attachCount = activeNote?.attachments?.length || 0;
  const lastEdited = activeNote?.updatedAt
    ? new Date(activeNote.updatedAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    : null;
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;

  // Empty state
  if (editorMode !== "new" && !activeNote) {
    return (
      <>
        <style>{css}</style>
        <div className="editor-empty">
          <div className="editor-empty-watermark">✍</div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="editor-empty-title">Nothing open</div>
            <div className="editor-empty-sub">Pick a note or start a new one.</div>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{css}</style>
      <div
        className="editor-root"
        onDragOver={e => { e.preventDefault(); if (activeNote) setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {/* Drag overlay */}
        <AnimatePresence>
          {isDragging && (
            <motion.div className="drag-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="drag-label">
                <Paperclip size={28} style={{ margin: "0 auto 8px", display: "block" }} />
                <div style={{ fontSize: 14, fontWeight: 600 }}>Drop to attach</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Writing pane ── */}
        <div className="editor-pane">
          {/* Toolbar */}
          <div className="editor-toolbar">
            <div className="toolbar-left">
              {editorMode === "existing" && activeNote && (
                <>
                  <FolderDropdown folders={folders} activeNote={activeNote} onMove={handleMoveNote} />
                  {lastEdited && (
                    <>
                      <span className="toolbar-sep">·</span>
                      <span className="toolbar-meta">{lastEdited}</span>
                    </>
                  )}
                </>
              )}
            </div>
            <div className="toolbar-right">
              <SavingIndicator isSaving={isSaving} visible={editorMode === "existing" && hasSaved} />

              {/* Attachment panel toggle */}
              {editorMode === "existing" && activeNote && (
                <button
                  className={`attach-toggle-btn${attachPanelOpen ? " active" : ""}`}
                  onClick={() => {
                    setAttachPanelOpen(o => !o);
                    if (attachPanelOpen) setSplitAttachment(null);
                  }}
                  title="Attachments"
                >
                  <Paperclip size={13} />
                  <span style={{ display: "none" }} className="attach-toggle-label">Files</span>
                  {attachCount > 0 && (
                    <span className="attach-count-badge">{attachCount}</span>
                  )}
                </button>
              )}

              {/* Split view toggle (only when attachment previewing) */}
              {splitAttachment && (
                <button
                  className="attach-toggle-btn active"
                  onClick={() => setSplitAttachment(null)}
                  title="Close preview"
                  style={{ gap: 4 }}
                >
                  <PanelRight size={13} />
                </button>
              )}

              {editorMode === "existing" && activeNote && (
                <motion.button
                  className="delete-btn"
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setIsDeleteModalOpen(true)}
                  title="Delete note"
                >
                  <Trash2 size={15} />
                </motion.button>
              )}
            </div>
          </div>

          {/* Writing area */}
          <div className="editor-scroll">
            <div className="editor-content">
              <textarea
                ref={titleRef}
                className="editor-title"
                placeholder="Untitled"
                value={title}
                onChange={handleTitleChange}
                autoFocus
                rows={1}
              />
              <div className="editor-divider" />
              <textarea
                className="editor-body"
                placeholder="Begin writing…"
                value={content}
                onChange={handleContentChange}
                onKeyDown={handleContentKeyDown}
              />
              {(content || title) && (
                <div className="wordcount">
                  <span>{words} {words === 1 ? "word" : "words"}</span>
                  <span style={{ color: "#1f1f1f" }}>·</span>
                  <span>{content.length} chars</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Attachment panel ── */}
        <AnimatePresence>
          {attachPanelOpen && activeNote && (
            <AttachmentPanel
              note={activeNote}
              onClose={() => { setAttachPanelOpen(false); setSplitAttachment(null); }}
              onPreview={handlePreview}
              previewingFile={splitAttachment}
              onDelete={(idx) => handleDeleteAttachment(idx)}
              onUpload={uploadFile}
            />
          )}
        </AnimatePresence>

        {/* ── Split preview ── */}
        <AnimatePresence>
          {splitAttachment && (
            <SplitPreview
              file={splitAttachment}
              onClose={() => setSplitAttachment(null)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Delete Note Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Note?"
        actions={<>
          <button onClick={() => setIsDeleteModalOpen(false)} style={cancelStyle}>Cancel</button>
          <button onClick={handleDeleteNote} style={deleteStyle}>Delete</button>
        </>}>
        <p className="modal-body-text">Delete <strong style={{ color: "#fff" }}>{activeNote?.title || "this note"}</strong>?</p>
      </Modal>

      {/* Delete Attachment Modal */}
      <Modal isOpen={attachmentToDelete !== null} onClose={() => setAttachmentToDelete(null)} title="Remove Attachment?"
        actions={<>
          <button onClick={() => setAttachmentToDelete(null)} style={cancelStyle}>Cancel</button>
          <button onClick={() => handleDeleteAttachment()} style={deleteStyle}>Remove</button>
        </>}>
        <p className="modal-body-text">Remove this attachment from the note?</p>
      </Modal>
    </>
  );
}

const cancelStyle = { padding: "8px 16px", fontSize: 13, color: "#666", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" };
const deleteStyle = { padding: "8px 18px", fontSize: 13, color: "#fff", background: "#dc2626", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 };