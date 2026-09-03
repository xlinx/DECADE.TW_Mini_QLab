# Mini QLab

Mini QLab is a responsive React cue-list controller for show-control workflows.
It runs cue groups manually, sequentially, from cron schedules, browser
hotkeys, or externally supplied timecode. Output is delivered through an event
callback so the host application can connect its own OSC, MIDI, WebSocket, or
device transport.

## Development

```bash
npm install
npm run dev
```

Run the automated tests and library build with:

```bash
npm test
npm run build
```

## Library usage

```jsx
import MiniQLab from 'mini-qlab';
import 'mini-qlab/styles.css';

export function ShowControl() {
  return (
    <MiniQLab
      rxJson={{ TC: { string: '01:00:00:00' } }}
      onEvent={(event) => {
        if (event.type === 'cue:dispatched') {
          console.log(event.source, event.command);
        }
      }}
    />
  );
}
```

`onEvent` receives sequence lifecycle events and cue dispatches. Dispatch
sources are `sequence`, `cron`, `timecode`, and `hotkey`. `rxJson` is optional;
provide `RX_JSON.TC.string` in that shape to use TC/LTC triggers.

See the bilingual [Mini QLab manual](./mini-qlab.manual.md) for complete
controls, configuration, and limitations.
