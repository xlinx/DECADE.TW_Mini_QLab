import {describe, expect, test} from 'vitest';
import {parseWebSocketCueControl} from '../src/lib/websocketCueControl.js';

describe('received WebSocket cue controls', () => {
  test('parses plain-text and JSON commands with decoded cue names', () => {
    expect(parseWebSocketCueControl('/cue/Intro/start')).toMatchObject({ok: true, cueName: 'Intro', action: 'start'});
    expect(parseWebSocketCueControl('{"command":"/cue/Scene%201/STOP"}')).toMatchObject({ok: true, cueName: 'Scene 1', action: 'stop'});
  });

  test('rejects malformed, unrelated, and incomplete commands', () => {
    expect(parseWebSocketCueControl('{oops')).toMatchObject({ok: false});
    expect(parseWebSocketCueControl('{"event":"cue"}')).toMatchObject({ok: false});
    expect(parseWebSocketCueControl('/cue/Intro/pause')).toMatchObject({ok: false});
    expect(parseWebSocketCueControl('/cue//start')).toMatchObject({ok: false});
  });
});
