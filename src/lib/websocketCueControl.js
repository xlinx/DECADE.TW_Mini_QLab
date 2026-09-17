export function parseWebSocketCueControl(payload) {
  const raw = typeof payload === 'string' ? payload.trim() : '';
  if (!raw) return {ok: false, reason: 'Received an empty message.'};
  let command = raw;
  if (raw.startsWith('{')) {
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed.command !== 'string') return {ok: false, reason: 'Received JSON does not contain a command string.'};
      command = parsed.command.trim();
    } catch {
      return {ok: false, reason: 'Received invalid JSON.'};
    }
  }
  const match = /^\/cue\/([^/]+)\/(start|stop)$/i.exec(command);
  if (!match) return {ok: false, reason: `Unsupported received command: ${command}`};
  try {
    const cueName = decodeURIComponent(match[1]).trim();
    if (!cueName) return {ok: false, reason: 'Cue name is required.'};
    return {ok: true, command, cueName, action: match[2].toLowerCase()};
  } catch {
    return {ok: false, reason: 'Cue name contains invalid URI encoding.'};
  }
}
