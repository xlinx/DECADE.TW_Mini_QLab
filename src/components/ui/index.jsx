import { useEffect, useRef } from 'react';

const buttonTones = {
    default: 'bg-violet-600 text-white hover:bg-violet-500',
    danger: 'bg-rose-600 text-white hover:bg-rose-500',
    outline: 'border border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-800',
    ghost: 'text-slate-300 hover:bg-slate-800'
};

export function Button({ className = '', tone = 'default', children, type = 'button', ...props }) {
    return <button type={type} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${buttonTones[tone]} ${className}`} {...props}>{children}</button>;
}

export function Badge({ className = '', children, tone = 'default' }) {
    const tones = { default: 'bg-slate-800 text-slate-200', success: 'bg-emerald-950 text-emerald-300', danger: 'bg-rose-950 text-rose-300', info: 'bg-sky-950 text-sky-300', accent: 'bg-violet-950 text-violet-300' };
    return <span className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold ${tones[tone]} ${className}`}>{children}</span>;
}

export function Field({ className = '', label, ...props }) {
    return <label className="grid gap-1 text-sm text-slate-300">{label && <span>{label}</span>}<input className={`min-h-10 rounded-md border border-slate-700 bg-slate-950 px-3 text-slate-100 placeholder:text-slate-500 ${className}`} {...props} /></label>;
}

export function NumberField(props) {
    return <Field type="number" {...props} />;
}

export function Toggle({ checked, onChange, label }) {
    return <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 text-sm text-slate-200"><input className="sr-only" type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><span className={`h-5 w-9 rounded-full p-0.5 transition ${checked ? 'bg-violet-500' : 'bg-slate-700'}`}><span className={`block h-4 w-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : ''}`} /></span>{label}</label>;
}

export function Panel({ className = '', title, actions, children }) {
    return <section className={`rounded-lg border border-slate-800 bg-slate-900/80 shadow-lg shadow-black/20 ${className}`}>{(title || actions) && <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">{title && <div>{title}</div>}{actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}</header>}<div className="p-4">{children}</div></section>;
}

export function CollapsiblePanel({ label, actions, children, defaultOpen = false }) {
    return <details className="rounded-lg border border-slate-800 bg-slate-900/80" open={defaultOpen}><summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-slate-100"><span>{label}</span>{actions && <span onClick={(event) => event.stopPropagation()}>{actions}</span>}</summary><div className="border-t border-slate-800 p-4">{children}</div></details>;
}

export function DataTable({ columns, rows, rowKey, className = '' }) {
    return <div className={`overflow-x-auto ${className}`}><table className="w-full min-w-max border-collapse text-left text-sm"><thead className="border-b border-slate-700 text-slate-400"><tr>{columns.map((column) => <th key={column.key} className="px-3 py-2 font-medium">{column.label}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={row[rowKey] ?? index} className="border-b border-slate-800 last:border-0">{columns.map((column) => <td key={column.key} className="px-3 py-2 align-middle">{column.render ? column.render(row, index) : row[column.key]}</td>)}</tr>)}</tbody></table></div>;
}

export function ConfirmDialog({ open, title, children, confirmLabel = 'Confirm', onCancel, onConfirm }) {
    const ref = useRef(null);
    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);
    return <dialog ref={ref} className="w-full max-w-md rounded-lg border border-slate-700 bg-slate-900 p-0 text-slate-100 backdrop:bg-black/70" onCancel={onCancel}><div className="p-5"><h2 className="text-lg font-semibold">{title}</h2><div className="mt-3 text-slate-300">{children}</div><div className="mt-5 flex justify-end gap-2"><Button tone="ghost" onClick={onCancel}>Cancel</Button><Button tone="danger" onClick={onConfirm}>{confirmLabel}</Button></div></div></dialog>;
}
