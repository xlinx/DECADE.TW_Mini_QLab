export function ActiveCuePanel({ groups, open }) {
  if (!open) return null;
  const active = groups.flatMap(group => group.cues.filter(cue => cue.status === 'LIVE').map(cue => ({ group: group.name, cue })));
  return <aside aria-label="Active cues" className="w-full shrink-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:w-72 dark:border-slate-800 dark:bg-slate-900"><h2 className="font-black">Active cues</h2><p className="mb-4 text-sm text-slate-500">Currently waiting to dispatch</p>{active.length ? active.map(({ group,cue }) => <div key={cue.id} className="mb-2 rounded-lg bg-amber-50 p-3 dark:bg-amber-950/30"><strong>{cue.command || 'Untitled cue'}</strong><p className="text-xs">{group} · {cue.progress}%</p></div>) : <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700">No live cues</p>}</aside>;
}
