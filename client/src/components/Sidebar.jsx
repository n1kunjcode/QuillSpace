import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import Modal from "./Modal";
import { Folder, FileText, Plus, Search, ChevronRight, ChevronDown, Edit2, Trash2, PanelLeftClose, PanelLeft, X, LogOut, User } from "lucide-react";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');

  .sb-root {
    height: 100%;
    border-right: 1px solid rgba(255,255,255,0.07);
    background: #111;
    display: flex;
    flex-direction: column;
    width: 240px;
    flex-shrink: 0;
    font-family: 'DM Sans', system-ui, sans-serif;
  }

  .sb-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 14px 14px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    flex-shrink: 0;
  }

  .sb-logo {
    display: flex;
    align-items: center;
    gap: 9px;
    font-family: 'Playfair Display', serif;
    font-size: 15px;
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.01em;
  }
  .sb-logo-icon {
    width: 28px; height: 28px;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px;
    flex-shrink: 0;
  }

  .sb-icon-btn {
    background: none;
    border: none;
    color: #444;
    cursor: pointer;
    padding: 6px;
    border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
    transition: color 0.2s, background 0.2s;
  }
  .sb-icon-btn:hover { color: #ccc; background: rgba(255,255,255,0.07); }

  .sb-search-wrap {
    padding: 10px 12px;
    flex-shrink: 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  .sb-search-inner { position: relative; display: flex; align-items: center; }
  .sb-search-icon {
    position: absolute; left: 10px; color: #444;
    display: flex; align-items: center; pointer-events: none; transition: color 0.2s;
  }
  .sb-search-input {
    width: 100%;
    padding: 8px 32px 8px 32px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 9px;
    color: #ddd;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    outline: none;
    transition: border-color 0.2s, background 0.2s;
  }
  .sb-search-input::placeholder { color: #333; }
  .sb-search-input:focus { border-color: rgba(245,158,11,0.4); background: rgba(255,255,255,0.07); }
  .sb-search-clear {
    position: absolute; right: 8px;
    background: none; border: none; color: #444; cursor: pointer;
    display: flex; align-items: center; transition: color 0.2s; padding: 2px;
  }
  .sb-search-clear:hover { color: #ccc; }

  .sb-list {
    flex: 1; overflow-y: auto;
    padding: 8px 8px;
  }
  .sb-list::-webkit-scrollbar { width: 4px; }
  .sb-list::-webkit-scrollbar-track { background: transparent; }
  .sb-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }

  .sb-section-label {
    font-size: 10px; font-weight: 600; color: #333;
    text-transform: uppercase; letter-spacing: 0.12em;
    padding: 12px 8px 6px;
  }

  .sb-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 7px 8px; border-radius: 8px; cursor: pointer;
    border-left: 2px solid transparent;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
    color: #555; user-select: none;
  }
  .sb-row:hover { background: rgba(255,255,255,0.05); color: #ccc; }
  .sb-row.active {
    background: rgba(245,158,11,0.08);
    border-left-color: #f59e0b;
    color: #f5c97a;
    padding-left: 6px;
  }
  .sb-row-left {
    display: flex; align-items: center; gap: 7px;
    flex: 1; min-width: 0; overflow: hidden;
  }
  .sb-row-name {
    font-size: 13px; font-weight: 500;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;
  }
  .sb-row-name.compact { font-size: 12px; }
  .sb-badge { font-size: 10px; color: #333; margin-left: auto; flex-shrink: 0; padding-right: 4px; }
  .sb-row-actions { display: flex; align-items: center; gap: 2px; opacity: 0; transition: opacity 0.15s; flex-shrink: 0; }
  .sb-row:hover .sb-row-actions { opacity: 1; }
  .sb-action-btn {
    background: none; border: none; color: #444; cursor: pointer;
    padding: 4px; border-radius: 5px; display: flex; align-items: center;
    transition: color 0.15s, background 0.15s;
  }
  .sb-action-btn.rename:hover { color: #60a5fa; background: rgba(96,165,250,0.1); }
  .sb-action-btn.delete:hover { color: #f87171; background: rgba(248,113,113,0.1); }

  .sb-children {
    margin-left: 16px; border-left: 1px solid rgba(255,255,255,0.06);
    padding-left: 8px; overflow: hidden;
  }
  .sb-children-empty { padding: 6px 8px; font-size: 11px; color: #2a2a2a; font-style: italic; }

  .sb-empty { text-align: center; padding: 48px 16px; color: #2a2a2a; }
  .sb-empty p { font-size: 13px; margin-bottom: 4px; }
  .sb-empty span { font-size: 11px; color: #222; }

  /* Bottom bar */
  .sb-bottom {
    flex-shrink: 0;
    border-top: 1px solid rgba(255,255,255,0.06);
    padding: 8px;
    display: flex;
    gap: 4px;
  }
  .sb-new-note-btn {
    flex: 1;
    display: flex; align-items: center; gap: 8px;
    padding: 9px 12px;
    background: none; border: none; border-radius: 9px;
    color: #555;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
    cursor: pointer; transition: color 0.2s, background 0.2s; text-align: left;
  }
  .sb-new-note-btn:hover { color: #fff; background: rgba(255,255,255,0.06); }
  .sb-new-note-icon {
    width: 20px; height: 20px;
    background: rgba(74,222,128,0.12); border-radius: 5px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; color: #4ade80;
  }
  .sb-new-folder-btn {
    padding: 9px 10px; background: none; border: none; border-radius: 9px;
    color: #444; cursor: pointer; display: flex; align-items: center;
    transition: color 0.2s, background 0.2s;
  }
  .sb-new-folder-btn:hover { color: #fb923c; background: rgba(251,146,60,0.1); }

  /* User/account footer */
  .sb-user {
    flex-shrink: 0;
    border-top: 1px solid rgba(255,255,255,0.06);
    padding: 10px 14px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .sb-avatar {
    width: 28px; height: 28px;
    border-radius: 50%;
    background: rgba(245,158,11,0.15);
    border: 1px solid rgba(245,158,11,0.25);
    display: flex; align-items: center; justify-content: center;
    color: #f59e0b;
    flex-shrink: 0;
    font-size: 12px;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
  }
  .sb-user-info { flex: 1; min-width: 0; }
  .sb-user-name { font-size: 12px; font-weight: 600; color: #888; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sb-user-email { font-size: 10px; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sb-logout-btn {
    background: none; border: none; color: #333; cursor: pointer;
    padding: 5px; border-radius: 6px; display: flex; align-items: center;
    transition: color 0.2s, background 0.2s; flex-shrink: 0;
  }
  .sb-logout-btn:hover { color: #f87171; background: rgba(248,113,113,0.1); }

  /* Collapsed */
  .sb-collapsed {
    height: 100%;
    border-right: 1px solid rgba(255,255,255,0.07);
    background: #111;
    display: flex; flex-direction: column; align-items: center;
    padding: 12px 0; gap: 4px;
    width: 52px; flex-shrink: 0;
  }

  /* Modal input */
  .modal-input {
    width: 100%; padding: 12px 14px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px; color: #fff;
    font-family: 'DM Sans', sans-serif; font-size: 14px;
    outline: none; transition: border-color 0.2s;
  }
  .modal-input:focus { border-color: rgba(245,158,11,0.5); }
  .modal-input::placeholder { color: #333; }

  .chevron-btn {
    background: none; border: none; color: #333; cursor: pointer;
    display: flex; align-items: center; padding: 2px; border-radius: 4px;
    flex-shrink: 0; transition: color 0.15s;
  }
  .chevron-btn:hover { color: #888; }
`;

export default function Sidebar({ onNavigate }) {
  const { activeFolder, setActiveFolder, activeNote, setActiveNote, folders, notes, refreshData, searchQuery, setSearchQuery, setEditorMode } = useApp();
  const { userMeta, logout } = useAuth();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState({});
  const searchInputRef = useRef(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [inputModal, setInputModal] = useState({ isOpen: false, type: null, item: null, value: "" });

  const sortedNotes = [...notes].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  const sortedFolders = [...folders].sort((a, b) => new Date(b.lastAccessedAt || b.updatedAt || b.createdAt) - new Date(a.lastAccessedAt || a.updatedAt || a.createdAt));
  const looseNotes = sortedNotes.filter(n => !n.folderId);

  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape" && searchQuery && document.activeElement === searchInputRef.current) {
        setSearchQuery(""); searchInputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [searchQuery, setSearchQuery]);

  const toggleFolder = (id) => setExpandedFolders(p => ({ ...p, [id]: !p[id] }));

  const handleInputSubmit = async () => {
    const { type, item, value } = inputModal;
    if (!value.trim()) return;
    try {
      if (type === "createFolder") await api.post("/folders", { name: value });
      else if (type === "renameFolder" && value !== item.name) await api.put(`/folders/${item._id}`, { name: value });
      else if (type === "renameNote" && value !== item.title) await api.patch(`/notes/${item._id}`, { title: value });
      refreshData();
      setInputModal({ ...inputModal, isOpen: false });
    } catch (err) { console.error(err); }
  };

  const handleCreateNote = async () => {
    try {
      const res = await api.post("/notes", { title: "Untitled", folderId: activeFolder?._id || null });
      refreshData(); setActiveNote(res.data); setEditorMode("existing");
      onNavigate?.();
    } catch (err) { console.error(err); }
  };

  const handleNoteClick = (note, folder = null) => {
    setActiveFolder(folder); setActiveNote(note); setEditorMode("existing");
    if (searchQuery) setSearchQuery("");
    onNavigate?.();
  };

  const handleFolderClick = (folder) => {
    toggleFolder(folder._id); setActiveFolder(folder); setActiveNote(null); setEditorMode("new");
    if (searchQuery) setSearchQuery("");
  };

  const confirmDelete = (type, item) => { setItemToDelete({ type, item }); setIsDeleteModalOpen(true); };

  const deleteItem = async () => {
    if (!itemToDelete) return;
    const { type, item } = itemToDelete;
    try {
      if (type === "folder") {
        await api.delete(`/folders/${item._id}`);
        if (activeFolder?._id === item._id) { setActiveFolder(null); setActiveNote(null); setEditorMode("new"); }
      } else {
        await api.delete(`/notes/${item._id}`);
        if (activeNote?._id === item._id) { setActiveNote(null); setEditorMode("new"); }
      }
      refreshData(); setIsDeleteModalOpen(false); setItemToDelete(null);
    } catch (err) { console.error(err); }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const openInputModal = (type, item = null) => setInputModal({
    isOpen: true, type, item,
    value: type === "renameFolder" ? item.name : type === "renameNote" ? item.title : ""
  });

  const filteredFolders = searchQuery ? sortedFolders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())) : sortedFolders;
  const filteredNotes = searchQuery ? sortedNotes.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()) || (n.folderId && folders.find(f => f._id === n.folderId)?.name.toLowerCase().includes(searchQuery.toLowerCase()))) : sortedNotes;
  const getFolderName = (note) => note.folderId ? folders.find(f => f._id === note.folderId)?.name : null;

  // User initials
  const initials = userMeta?.name ? userMeta.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";

  if (collapsed) {
    return (
      <>
        <style>{css}</style>
        <div className="sb-collapsed">
          <button className="sb-icon-btn" onClick={() => setCollapsed(false)} title="Expand"><PanelLeft size={18} /></button>
          <div style={{ width: "80%", height: 1, background: "rgba(255,255,255,0.06)", margin: "2px 0" }} />
          <button className="sb-icon-btn" onClick={handleCreateNote} title="New Note" style={{ color: "#4ade80" }}><Plus size={18} /></button>
          <button className="sb-icon-btn" onClick={() => openInputModal("createFolder")} title="New Folder" style={{ color: "#fb923c" }}><Folder size={18} /></button>
          <div style={{ flex: 1 }} />
          <button className="sb-icon-btn" onClick={handleLogout} title="Logout" style={{ color: "#555" }}><LogOut size={16} /></button>
        </div>
        <Modal isOpen={inputModal.isOpen} onClose={() => setInputModal({ ...inputModal, isOpen: false })} title="New Folder"
          actions={<><button onClick={() => setInputModal({ ...inputModal, isOpen: false })} style={cancelBtnStyle}>Cancel</button><button onClick={handleInputSubmit} style={confirmBtnStyle}>Create</button></>}>
          <input autoFocus className="modal-input" placeholder="Folder name…" value={inputModal.value} onChange={e => setInputModal({ ...inputModal, value: e.target.value })} onKeyDown={e => { if (e.key === "Enter") handleInputSubmit(); if (e.key === "Escape") setInputModal({ ...inputModal, isOpen: false }); }} />
        </Modal>
      </>
    );
  }

  return (
    <>
      <style>{css}</style>
      <motion.div className="sb-root" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.4 }}>

        {/* Header */}
        <div className="sb-header">
          <div className="sb-logo">
            <div className="sb-logo-icon">🪶</div>
            QuillSpace
          </div>
          <button className="sb-icon-btn" onClick={() => setCollapsed(true)} title="Collapse"><PanelLeftClose size={16} /></button>
        </div>

        {/* Search */}
        <div className="sb-search-wrap">
          <div className="sb-search-inner">
            <span className="sb-search-icon"><Search size={13} /></span>
            <input ref={searchInputRef} className="sb-search-input" type="text" placeholder="Search…" value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => { if (e.key === "Escape") { setSearchQuery(""); e.target.blur(); } }} />
            {searchQuery && <button className="sb-search-clear" onClick={() => setSearchQuery("")}><X size={13} /></button>}
          </div>
        </div>

        {/* List */}
        <div className="sb-list">
          <AnimatePresence mode="wait">
            {searchQuery ? (
              <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {filteredFolders.length > 0 && <>
                  <div className="sb-section-label">Folders</div>
                  {filteredFolders.map(f => (
                    <SbRow key={f._id} label={f.name} icon={<Folder size={14} />} active={activeFolder?._id === f._id && !activeNote}
                      onClick={() => handleFolderClick(f)} onRename={() => openInputModal("renameFolder", f)} onDelete={() => confirmDelete("folder", f)}
                      badge={sortedNotes.filter(n => n.folderId === f._id).length || null} />
                  ))}
                </>}
                {filteredNotes.length > 0 && <>
                  <div className="sb-section-label">Notes</div>
                  {filteredNotes.map(n => {
                    const fn = getFolderName(n);
                    return <SbRow key={n._id} label={n.title || "Untitled"} subtitle={fn} icon={<FileText size={14} />}
                      active={activeNote?._id === n._id}
                      onClick={() => handleNoteClick(n, fn ? folders.find(f => f._id === n.folderId) : null)}
                      onRename={() => openInputModal("renameNote", n)} onDelete={() => confirmDelete("note", n)} />;
                  })}
                </>}
                {filteredFolders.length === 0 && filteredNotes.length === 0 && (
                  <div className="sb-empty"><p>No results</p></div>
                )}
              </motion.div>
            ) : (
              <motion.div key="normal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {sortedFolders.length > 0 && <>
                  <div className="sb-section-label">Folders</div>
                  {sortedFolders.map(f => {
                    const fNotes = sortedNotes.filter(n => n.folderId === f._id);
                    const expanded = expandedFolders[f._id];
                    return (
                      <div key={f._id}>
                        <SbRow label={f.name} icon={<Folder size={14} />} active={activeFolder?._id === f._id && !activeNote}
                          expanded={expanded} onToggle={e => { e.stopPropagation(); toggleFolder(f._id); }}
                          onClick={() => handleFolderClick(f)} onRename={() => openInputModal("renameFolder", f)}
                          onDelete={() => confirmDelete("folder", f)} badge={fNotes.length || null} />
                        <AnimatePresence>
                          {expanded && (
                            <motion.div className="sb-children" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }}>
                              {fNotes.length === 0
                                ? <div className="sb-children-empty">Empty folder</div>
                                : fNotes.map(n => (
                                  <SbRow key={n._id} label={n.title || "Untitled"} icon={<FileText size={13} />} compact
                                    active={activeNote?._id === n._id}
                                    onClick={e => { e.stopPropagation(); handleNoteClick(n, f); }}
                                    onRename={() => openInputModal("renameNote", n)} onDelete={() => confirmDelete("note", n)} />
                                ))
                              }
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </>}
                {looseNotes.length > 0 && <>
                  <div className="sb-section-label">Notes</div>
                  {looseNotes.map(n => (
                    <SbRow key={n._id} label={n.title || "Untitled"} icon={<FileText size={14} />}
                      active={activeNote?._id === n._id && !activeFolder}
                      onClick={() => handleNoteClick(n)} onRename={() => openInputModal("renameNote", n)} onDelete={() => confirmDelete("note", n)} />
                  ))}
                </>}
                {sortedFolders.length === 0 && looseNotes.length === 0 && (
                  <div className="sb-empty"><p>Nothing here yet</p><span>Create your first note below</span></div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom actions */}
        <div className="sb-bottom">
          <button className="sb-new-note-btn" onClick={handleCreateNote}>
            <span className="sb-new-note-icon"><Plus size={13} /></span>
            New Note
          </button>
          <button className="sb-new-folder-btn" onClick={() => openInputModal("createFolder")} title="New Folder">
            <Folder size={16} />
          </button>
        </div>

        {/* User / logout */}
        <div className="sb-user">
          <div className="sb-avatar">
            {userMeta?.picture
              ? <img src={userMeta.picture} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
              : initials
            }
          </div>
          <div className="sb-user-info">
            <div className="sb-user-name">{userMeta?.name || "Account"}</div>
            <div className="sb-user-email">{userMeta?.email || ""}</div>
          </div>
          <button className="sb-logout-btn" onClick={handleLogout} title="Log out"><LogOut size={14} /></button>
        </div>
      </motion.div>

      {/* DELETE MODAL */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}
        title={`Delete ${itemToDelete?.type === "folder" ? "Folder" : "Note"}?`}
        actions={<><button onClick={() => setIsDeleteModalOpen(false)} style={cancelBtnStyle}>Cancel</button><button onClick={deleteItem} style={deleteBtnStyle}>Delete</button></>}>
        <p style={{ color: "#ccc", fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>
          Delete <strong style={{ color: "#fff" }}>{itemToDelete?.item.name || itemToDelete?.item.title}</strong>?
        </p>
        {itemToDelete?.type === "folder" && (
          <p style={{ fontSize: 12, color: "#f87171", marginTop: 12, padding: "10px 12px", background: "rgba(239,68,68,0.08)", borderRadius: 8, border: "1px solid rgba(239,68,68,0.2)", fontFamily: "'DM Sans', sans-serif" }}>
            ⚠️ All notes inside this folder will also be deleted.
          </p>
        )}
      </Modal>

      {/* INPUT MODAL */}
      <Modal isOpen={inputModal.isOpen} onClose={() => setInputModal({ ...inputModal, isOpen: false })}
        title={inputModal.type === "createFolder" ? "New Folder" : inputModal.type === "renameFolder" ? "Rename Folder" : "Rename Note"}
        actions={<><button onClick={() => setInputModal({ ...inputModal, isOpen: false })} style={cancelBtnStyle}>Cancel</button><button onClick={handleInputSubmit} style={confirmBtnStyle}>{inputModal.type === "createFolder" ? "Create" : "Save"}</button></>}>
        <input autoFocus className="modal-input" placeholder="Enter name…" value={inputModal.value}
          onChange={e => setInputModal({ ...inputModal, value: e.target.value })}
          onKeyDown={e => { if (e.key === "Enter") handleInputSubmit(); if (e.key === "Escape") setInputModal({ ...inputModal, isOpen: false }); }} />
      </Modal>
    </>
  );
}

const cancelBtnStyle = { padding: "8px 16px", fontSize: 13, color: "#666", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" };
const confirmBtnStyle = { padding: "8px 18px", fontSize: 13, color: "#fff", background: "#2563eb", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 };
const deleteBtnStyle = { padding: "8px 18px", fontSize: 13, color: "#fff", background: "#dc2626", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 };

function SbRow({ label, subtitle, icon, active, compact, expanded, onToggle, onClick, onRename, onDelete, badge }) {
  return (
    <div className={`sb-row${active ? " active" : ""}`} onClick={onClick}>
      <div className="sb-row-left">
        {onToggle
          ? <button className="chevron-btn" onClick={onToggle}>{expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}</button>
          : <div style={{ width: 16, flexShrink: 0 }} />
        }
        <span style={{ color: active ? "#f5c97a" : "#333", flexShrink: 0, display: "flex" }}>{icon}</span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className={`sb-row-name${compact ? " compact" : ""}`}>{label}</div>
          {subtitle && <div style={{ fontSize: 10, color: "#333", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{subtitle}</div>}
        </div>
        {badge && <span className="sb-badge">{badge}</span>}
      </div>
      <div className="sb-row-actions">
        <button className="sb-action-btn rename" onClick={e => { e.stopPropagation(); onRename(); }} title="Rename"><Edit2 size={11} /></button>
        <button className="sb-action-btn delete" onClick={e => { e.stopPropagation(); onDelete(); }} title="Delete"><Trash2 size={11} /></button>
      </div>
    </div>
  );
}