import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import Editor from "../components/Editor";
import { motion, AnimatePresence } from "framer-motion";
import { Menu } from "lucide-react";

const css = `
  .app-layout {
    height: 100vh;
    width: 100%;
    display: flex;
    background: #0e0e0e;
    color: #fff;
    overflow: hidden;
    position: relative;
  }

  /* Desktop: sidebar always visible */
  .app-sidebar-desktop {
    height: 100%;
    flex-shrink: 0;
    z-index: 20;
    display: flex;
  }

  .app-main {
    flex: 1;
    height: 100%;
    min-width: 0;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  }

  /* Mobile hamburger button */
  .mobile-menu-btn {
    display: none;
    position: fixed;
    top: 12px;
    left: 12px;
    z-index: 60;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 9px;
    width: 36px;
    height: 36px;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #aaa;
    transition: background 0.2s, color 0.2s;
  }
  .mobile-menu-btn:hover { background: rgba(255,255,255,0.13); color: #fff; }

  /* Mobile overlay backdrop */
  .mobile-backdrop {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    z-index: 40;
    backdrop-filter: blur(4px);
  }

  /* Mobile sidebar drawer */
  .mobile-sidebar-drawer {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 50;
  }

  @media (max-width: 768px) {
    .app-sidebar-desktop { display: none; }
    .mobile-menu-btn { display: flex; }
    .mobile-backdrop { display: block; }
    .mobile-sidebar-drawer { display: block; }

    .app-main {
      width: 100%;
    }
  }
`;

export default function AppLayout() {
  const { mobileSidebarOpen, setMobileSidebarOpen } = useApp();
  const { isAuthenticated, authLoading } = useAuth();
  const navigate = useNavigate();

  // Auth guard — waits for token restore to finish before redirecting
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, authLoading]);

  return (
    <>
      <style>{css}</style>
      <div className="app-layout">

        {/* Desktop sidebar */}
        <div className="app-sidebar-desktop">
          <Sidebar />
        </div>

        {/* Mobile hamburger */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </button>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                className="mobile-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileSidebarOpen(false)}
              />
              {/* Drawer */}
              <motion.div
                className="mobile-sidebar-drawer"
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}
              >
                <Sidebar onNavigate={() => setMobileSidebarOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <div className="app-main">
          <Editor />
        </div>
      </div>
    </>
  );
}