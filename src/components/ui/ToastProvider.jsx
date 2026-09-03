import { createContext, useContext, useState } from 'react';
import { Button } from './index.jsx';

const ToastContext = createContext({ toast: () => {} });

export function ToastProvider({ children }) {
    const [items, setItems] = useState([]);
    const toast = ({ type, message }) => {
        const id = crypto.randomUUID();
        setItems((current) => [...current, { id, type, message }]);
        window.setTimeout(() => setItems((current) => current.filter((item) => item.id !== id)), 4000);
    };
    return <ToastContext.Provider value={{ toast }}>{children}<div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2" aria-live="polite">{items.map((item) => <div key={item.id} className={`pointer-events-auto flex items-center gap-3 rounded-md border px-3 py-2 shadow-xl ${item.type === 'error' ? 'border-rose-700 bg-rose-950 text-rose-100' : 'border-emerald-700 bg-emerald-950 text-emerald-100'}`}><span>{item.message}</span><Button tone="ghost" className="min-h-0 px-1 py-1" aria-label="Dismiss notification" onClick={() => setItems((current) => current.filter((toastItem) => toastItem.id !== item.id))}>×</Button></div>)}</div></ToastContext.Provider>;
}

export function useToast() {
    return useContext(ToastContext);
}
