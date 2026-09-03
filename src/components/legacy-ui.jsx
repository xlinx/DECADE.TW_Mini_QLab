import React from 'react';

const cx = (...classes) => classes.filter(Boolean).join(' ');
export function Button({ children, icon, iconx, danger, disabled, onClick, style, className, ...props }) { return <button {...props} disabled={disabled} onClick={onClick} style={style} className={cx('inline-flex min-h-9 items-center justify-center gap-2 rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-100 hover:bg-slate-700 disabled:opacity-40', danger && 'border-rose-700 bg-rose-950 text-rose-200', className)}>{icon || iconx}{children}</button>; }
export function Card({ title, extra, children, style, className }) { return <section style={style} className={cx('rounded-lg border border-slate-800 bg-slate-900/80', className)}>{(title || extra) && <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 p-3">{title}<div>{extra}</div></header>}<div className="p-3">{children}</div></section>; }
export function Row({ children, className, style, justify }) { return <div style={style} className={cx('flex flex-wrap items-center gap-2', justify === 'space-between' && 'justify-between', className)}>{children}</div>; }
export function Col({ children, className, style }) { return <div style={style} className={cx('min-w-0', className)}>{children}</div>; }
export function Space({ children, vertical, className, style, onClick }) { return <div onClick={onClick} style={style} className={cx('flex flex-wrap gap-2', vertical && 'flex-col', className)}>{children}</div>; }
Space.Compact = ({ children, className }) => <div className={cx('inline-flex flex-wrap gap-px', className)}>{children}</div>;
Space.Addon = ({ children }) => <span className="inline-flex items-center rounded bg-slate-800 px-2 text-sm text-slate-300">{children}</span>;
export function Input({ className, style, styles, ...props }) { return <input {...props} style={{ ...style, ...styles }} className={cx('min-h-9 rounded border border-slate-700 bg-slate-950 px-2 text-slate-100 disabled:opacity-50', className)} />; }
Input.TextArea = ({ className, ...props }) => <textarea {...props} className={cx('rounded border border-slate-700 bg-slate-950 p-2 text-slate-100', className)} />;
export function InputNumber(props) { return <Input type="number" {...props} />; }
export function Tag({ children, style, className, onClick }) { return <span onClick={onClick} style={style} className={cx('inline-flex items-center gap-1 rounded bg-violet-950 px-2 py-1 text-sm text-violet-200', className)}>{children}</span>; }
export function Switch({ checked, value, onChange, checkedChildren, unCheckedChildren }) { const active = checked ?? value ?? false; return <label className="inline-flex cursor-pointer items-center gap-2"><input type="checkbox" className="sr-only" checked={active} onChange={(event) => onChange(event.target.checked)} /><span className={cx('h-5 w-9 rounded-full p-0.5', active ? 'bg-violet-500' : 'bg-slate-700')}><span className={cx('block h-4 w-4 rounded-full bg-white transition-transform', active && 'translate-x-4')} /></span><span className="text-xs text-slate-300">{active ? checkedChildren : unCheckedChildren}</span></label>; }
export function Divider({ children }) { return <div className="my-3 flex items-center gap-2 text-xs text-slate-500 before:h-px before:flex-1 before:bg-slate-800 after:h-px after:flex-1 after:bg-slate-800">{children}</div>; }
export function Table({ dataSource = [], columns = [], rowKey }) { return <div className="overflow-x-auto"><table className="w-full min-w-max text-left text-sm"><thead><tr className="border-b border-slate-700">{columns.map((c) => <th key={c.key || c.dataIndex} className="p-2 text-slate-400">{c.title}</th>)}</tr></thead><tbody>{dataSource.map((row, index) => <tr key={row[rowKey] || index} className="border-b border-slate-800">{columns.map((c) => <td key={c.key || c.dataIndex} className="p-2">{c.render ? c.render(row[c.dataIndex], row, index) : row[c.dataIndex]}</td>)}</tr>)}</tbody></table></div>; }
export function Tooltip({ children, title }) { return <span title={title}>{children}</span>; }
export function Progress({ percent = 0 }) { return <div className="h-2 w-24 overflow-hidden rounded bg-slate-800"><div className="h-full bg-emerald-500" style={{ width: `${percent}%` }} /></div>; }
export function Upload({ children, beforeUpload }) { return <label className="cursor-pointer"><input className="sr-only" type="file" onChange={(e) => e.target.files[0] && beforeUpload(e.target.files[0])} />{children}</label>; }
export function Collapse({ items = [] }) { return <div className="mt-4 grid gap-3">{items.map((item) => <details key={item.key} className="rounded border border-slate-800 bg-slate-900"><summary className="cursor-pointer p-3 text-slate-100">{item.label}<span className="float-right" onClick={(e) => e.stopPropagation()}>{item.extra}</span></summary><div className="border-t border-slate-800 p-3">{item.children}</div></details>)}</div>; }
export function Splitter({ children, style }) { return <div style={style} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">{children}</div>; }
Splitter.Panel = ({ children, style }) => <div style={style}>{children}</div>;
export const Layout = {};
export const message = { success: () => {}, error: () => {} };
export const Typography = { Text: ({ children }) => <span>{children}</span> };
export const Flex = Space;
export const Alert = ({ message: text }) => <div>{text}</div>;
export const Statistic = { Timer: ({ children }) => <span>{children}</span> };
