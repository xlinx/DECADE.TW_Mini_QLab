# Cue-local audio tracks and timeline waveforms

## Goal

Allow every audio cue to select its own local MP3 or WAV track, play, pause,
or stop only that track, and show its complete amplitude waveform on the
timeline. Playback stays on the device: no audio bytes, file paths, or audio
commands are sent to WebSocket, stored in `TX_JSON_CMD`, or emitted as
command-dispatch events.

## Model

- A cue gains a third `type`: `audio`.
- Audio cues contain `audioAction`, one of `play`, `pause`, or `stop`.
- Every audio cue has its own ephemeral local attachment managed outside the
  persisted cue data: the selected `File`, object URL, `HTMLAudioElement`,
  decoded duration, and waveform peak data.
- The serialized cue data retains only its audio action. It never includes a
  selected file, file-system path, object URL, media element, duration, or
  waveform. Reloading or importing requires selecting tracks again.

## User interface

- The desktop table, mobile cue cards, and timeline cue editor offer **Audio**
  in the cue-type selector. Selecting it replaces command/target controls with
  an MP3/WAV local-file picker, selected filename or no-track state, a clear
  control, and an action selector for Play, Pause, or Stop.
- The timeline renders every selected audio cue’s full amplitude waveform
  across a bar sized from the decoded file duration.
- Every cue displays a compact, accessible, theme-aware inline SVG type icon:
  terminal-style for Command, branching arrow for Trigger, and waveform/music
  for Audio. The table, mobile cards, and timeline use the same icon mapping.
- Existing Command and Trigger layouts and behavior remain unchanged.

## Dispatch behavior

- The existing cue engine continues to schedule audio cues through sequence,
  single-cue, hotkey, cron, timecode, and WebSocket-start flows.
- On an audio-cue dispatch, the application finds that cue’s audio player and
  applies the action:
  - Play starts or resumes from the current position.
  - Pause preserves the current position.
  - Stop pauses and resets the current position to zero.
- If that cue has no local track selected, the application records a local warning in
  the cue log and does not attempt network delivery.
- Audio cues do not normalize a command, update the TX command store, send a
  WebSocket frame, or call the consumer `onEvent` callback as a
  `cue:dispatched` command.

## Lifecycle and cleanup

- Replacing or clearing a cue track pauses the old player, removes its source,
  and revokes its object URL.
- Removing a cue, resetting/importing groups, and unmounting release affected
  players and object URLs.
- A rejected browser `play()` promise is handled as a local warning rather
  than an unhandled error.

## Verification

- Unit-test creation, hydration, and persistence of audio cues, cue-local media
  lifecycle, and waveform data extraction.
- Component-test audio action controls, cue-local file selection, waveform
  rendering, and cleanup state.
- Component-test isolated Play, Pause, and Stop against mocked media elements.
- Component-test that audio dispatch neither calls `onEvent` with a command
  dispatch nor sends the configured WebSocket command.
- Run the complete test suite and production build.
