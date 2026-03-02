import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [activeFolder, setActiveFolder] = useState(null);
  const [activeNote, setActiveNote] = useState(null);
  const [editorMode, setEditorMode] = useState("new");
  const [expandedFolder, setExpandedFolder] = useState(null);
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [splitAttachment, setSplitAttachment] = useState(null);
  const [attachPanelOpen, setAttachPanelOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const { isAuthenticated, authLoading } = useAuth();

  const fetchFolders = async () => {
    try {
      const res = await api.get("/folders");
      const sorted = res.data.sort(
        (a, b) => new Date(b.lastAccessedAt) - new Date(a.lastAccessedAt)
      );
      setFolders(sorted);
    } catch (err) {
      console.error("Failed to fetch folders", err);
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await api.get("/notes");
      setNotes(res.data);
    } catch (err) {
      console.error("Failed to fetch notes", err);
    }
  };

  const refreshData = async () => {
    await Promise.all([fetchFolders(), fetchNotes()]);
  };

  // Close split view when active note changes
  useEffect(() => {
    setSplitAttachment(null);
    setAttachPanelOpen(false);
  }, [activeNote?._id]);

  // Only fetch data once auth state is confirmed
  useEffect(() => {
    if (authLoading) return; // wait for token restore
    if (isAuthenticated) {
      refreshData();
    } else {
      // Clear state on logout
      setNotes([]);
      setFolders([]);
      setActiveNote(null);
      setActiveFolder(null);
      setEditorMode("new");
    }
  }, [isAuthenticated, authLoading]);

  return (
    <AppContext.Provider
      value={{
        activeFolder, setActiveFolder,
        activeNote, setActiveNote,
        editorMode, setEditorMode,
        expandedFolder, setExpandedFolder,
        notes, setNotes,
        folders, setFolders,
        searchQuery, setSearchQuery,
        refreshData,
        splitAttachment, setSplitAttachment,
        attachPanelOpen, setAttachPanelOpen,
        mobileSidebarOpen, setMobileSidebarOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);