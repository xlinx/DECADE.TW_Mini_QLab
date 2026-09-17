import {describe, expect, test, vi} from 'vitest';
import {createLocalAudioTracks} from '../src/lib/localAudioTracks.js';

function player({play = () => Promise.resolve()} = {}) {
    return {play: vi.fn(play), pause: vi.fn(), currentTime: 12, src: ''};
}

describe('local audio tracks', () => {
    test('keeps decoded media and playback isolated per cue', async () => {
        const audioA = player(); const audioB = player();
        const tracks = createLocalAudioTracks({
            createAudio: vi.fn().mockReturnValueOnce(audioA).mockReturnValueOnce(audioB),
            createObjectURL: file => `blob:${file.name}`,
            decodeAudioData: async file => file.name === 'a.wav' ? {durationMs: 2500, peaks: [0.1, 0.8, 0.2]} : {durationMs: 1000, peaks: [0.5]}
        });
        await tracks.set('cue-a', new File(['a'], 'a.wav'));
        await tracks.set('cue-b', new File(['b'], 'b.wav'));
        await tracks.run('cue-a', 'play');

        expect(audioA.play).toHaveBeenCalledOnce();
        expect(audioB.play).not.toHaveBeenCalled();
        expect(tracks.get('cue-a')).toEqual({name: 'a.wav', durationMs: 2500, peaks: [0.1, 0.8, 0.2]});
    });
    test('plays, pauses, and stops one group-local track', async () => {
        const audio = player();
        const tracks = createLocalAudioTracks({createAudio: vi.fn(() => audio), createObjectURL: vi.fn(() => 'blob:intro')});
        tracks.set('group-1', new File(['audio'], 'intro.mp3', {type: 'audio/mpeg'}));

        await expect(tracks.run('group-1', 'play')).resolves.toEqual({ok: true});
        expect(audio.play).toHaveBeenCalledOnce();
        await expect(tracks.run('group-1', 'pause')).resolves.toEqual({ok: true});
        expect(audio.pause).toHaveBeenCalledOnce();
        await expect(tracks.run('group-1', 'stop')).resolves.toEqual({ok: true});
        expect(audio.pause).toHaveBeenCalledTimes(2);
        expect(audio.currentTime).toBe(0);
        expect(tracks.get('group-1')).toMatchObject({name: 'intro.mp3'});
    });

    test('reports missing tracks and rejected playback without throwing', async () => {
        const tracks = createLocalAudioTracks({createAudio: vi.fn(() => player({play: () => Promise.reject(new Error('blocked'))})), createObjectURL: vi.fn(() => 'blob:intro')});
        await expect(tracks.run('missing', 'play')).resolves.toEqual({ok: false, message: 'No local audio track selected.'});
        tracks.set('group-1', new File(['audio'], 'intro.wav', {type: 'audio/wav'}));
        await expect(tracks.run('group-1', 'play')).resolves.toEqual({ok: false, message: 'Audio playback failed: blocked'});
    });

    test('releases replaced and disposed object URLs', () => {
        const first = player();
        const second = player();
        const revokeObjectURL = vi.fn();
        const tracks = createLocalAudioTracks({
            createAudio: vi.fn().mockReturnValueOnce(first).mockReturnValueOnce(second),
            createObjectURL: file => `blob:${file.name}`,
            revokeObjectURL
        });
        tracks.set('group-1', new File(['old'], 'old.wav'));
        tracks.set('group-1', new File(['new'], 'new.wav'));
        tracks.dispose();

        expect(first.pause).toHaveBeenCalledOnce();
        expect(second.pause).toHaveBeenCalledOnce();
        expect(revokeObjectURL).toHaveBeenCalledWith('blob:old.wav');
        expect(revokeObjectURL).toHaveBeenCalledWith('blob:new.wav');
    });
});
