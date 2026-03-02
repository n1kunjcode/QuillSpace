import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function Modal({ isOpen, onClose, title, children, actions }) {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b border-neutral-800">
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-neutral-400 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-4 text-neutral-300">
                    {children}
                </div>

                {actions && (
                    <div className="flex justify-end gap-2 p-4 pt-0">
                        {actions}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
