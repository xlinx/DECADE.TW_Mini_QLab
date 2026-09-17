function waveformPeaks(buffer, buckets = 96) {
    const peaks = Array.from({length: buckets}, () => 0);
    const channels = Math.max(1, Number(buffer.numberOfChannels) || 1);
    const length = Math.max(1, Number(buffer.length) || 1);
    for (let bucket = 0; bucket < buckets; bucket++) {
        const start = Math.floor(bucket * length / buckets);
        const end = Math.max(start + 1, Math.floor((bucket + 1) * length / buckets));
        for (let channel = 0; channel < channels; channel++) {
            const data = buffer.getChannelData(channel);
            for (let index = start; index < Math.min(end, data.length); index++) peaks[bucket] = Math.max(peaks[bucket], Math.abs(data[index]));
        }
    }
    return peaks;
}

async function decodeLocalAudio(file) {
    const Context = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!Context || typeof file.arrayBuffer !== 'function') return {durationMs: 0, peaks: []};
    const context = new Context();
    try {
        const buffer = await context.decodeAudioData(await file.arrayBuffer());
        return {durationMs: Math.round(buffer.duration * 1000), peaks: waveformPeaks(buffer)};
    } finally {
        await context.close?.();
    }
}

export function createLocalAudioTracks({
    createAudio = source => new Audio(source),
    createObjectURL = file => URL.createObjectURL(file),
    revokeObjectURL = source => URL.revokeObjectURL(source),
    decodeAudioData = decodeLocalAudio
} = {}) {
    const tracks = new Map();

    function clear(cueId) {
        const track = tracks.get(cueId);
        if (!track) return;
        track.audio.pause();
        track.audio.src = '';
        revokeObjectURL(track.url);
        tracks.delete(cueId);
    }

    return {
        async set(cueId, file) {
            clear(cueId);
            const track = {name: file.name, url: createObjectURL(file), audio: null, durationMs: 0, peaks: []};
            track.audio = createAudio(track.url);
            tracks.set(cueId, track);
            try {
                const decoded = await decodeAudioData(file);
                if (tracks.get(cueId) === track) Object.assign(track, decoded);
            } catch {
            }
        },
        get(cueId) {
            const track = tracks.get(cueId);
            return track && {name: track.name, durationMs: track.durationMs, peaks: track.peaks};
        },
        async run(cueId, action) {
            const track = tracks.get(cueId);
            if (!track) return {ok: false, message: 'No local audio track selected.'};
            if (action === 'play') {
                try { await track.audio.play(); return {ok: true}; }
                catch (error) { return {ok: false, message: `Audio playback failed: ${error?.message || 'unknown error'}`}; }
            }
            if (action === 'pause') { track.audio.pause(); return {ok: true}; }
            if (action === 'stop') { track.audio.pause(); track.audio.currentTime = 0; return {ok: true}; }
            return {ok: false, message: 'Unknown audio action.'};
        },
        clear,
        dispose() { [...tracks.keys()].forEach(clear); }
    };
}
