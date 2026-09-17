import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import MiniQLab from '../src/PAGEXQ.jsx';
import { TX_STORE_KEY } from '../src/lib/cues.js';

const initialGroups = [{ name: 'Act', cues: [{ number: '1', command: '', afterWaitMs: 0, hotkey: 'g', ltcTrigger: '01:00:00:00' }], hotkeyEnabled: true, timecodeEnabled: true }];

function pointer(target, type, {clientX, clientY}) {
  const event = new Event(type, {bubbles: true});
  Object.defineProperties(event, {
    clientX: {value: clientX},
    clientY: {value: clientY},
    button: {value: 0}
  });
  fireEvent(target, event);
}

test('normalizes an edited command and dispatches it through onEvent', async () => {
  const user = userEvent.setup(); const onEvent = vi.fn();
  render(<MiniQLab initialGroups={initialGroups} onEvent={onEvent} />);
  const command = screen.getByLabelText('Command for cue 1');
  await user.type(command, 'lights'); await user.tab();
  expect(command).toHaveValue('lights/');
  await user.click(screen.getByRole('button', { name: 'GO Act' }));
  await waitFor(() => expect(onEvent).toHaveBeenCalledWith(expect.objectContaining({ type: 'cue:dispatched', command: 'lights/', source: 'sequence' })));
});

test('lays out command and trigger content controls in one row', async () => {
  const user = userEvent.setup();
  render(<MiniQLab initialGroups={initialGroups} />);
  const type = screen.getByLabelText('Type for cue 1');
  expect(type.parentElement).toHaveClass('grid-cols-[minmax(7rem,.7fr)_minmax(10rem,1.3fr)]');
  await user.selectOptions(type, 'trigger');
  expect(screen.getByLabelText('Target group for cue 1')).toBeInTheDocument();
  expect(screen.getByLabelText('Target cue for cue 1')).toBeInTheDocument();
  expect(type.parentElement).toHaveClass('grid-cols-4');
});

test('selects a start, stop, or pause action for trigger cues', async () => {
  const user = userEvent.setup();
  render(<MiniQLab initialGroups={initialGroups} />);
  await user.selectOptions(screen.getByLabelText('Type for cue 1'), 'trigger');
  const action = screen.getByLabelText('Trigger action for cue 1');
  expect(action).toHaveValue('start');
  await user.selectOptions(action, 'pause');
  expect(action).toHaveValue('pause');
});

test('offers play, pause, and stop as audio cue actions', async () => {
  const user = userEvent.setup();
  render(<MiniQLab initialGroups={initialGroups} />);
  const type = screen.getByLabelText('Type for cue 1');
  await user.selectOptions(type, 'audio');
  const action = screen.getByLabelText('Audio action for cue 1');
  expect(action).toHaveValue('play');
  expect(action).toHaveTextContent('Start');
  await user.selectOptions(action, 'pause');
  expect(action).toHaveValue('pause');
  expect(screen.queryByLabelText('Command for cue 1')).not.toBeInTheDocument();
});

test('keeps audio controls compact on one row in the Type / Content cell', async () => {
  const user = userEvent.setup();
  render(<MiniQLab initialGroups={initialGroups} />);
  await user.selectOptions(screen.getByLabelText('Type for cue 1'), 'audio');
  expect(screen.getByLabelText('Audio action for cue 1').parentElement).toHaveClass('flex');
  expect(screen.getByLabelText('Audio action for cue 1').parentElement).not.toHaveClass('flex-col');
});

test('plays a selected audio track locally without dispatching a command', async () => {
  const play = vi.fn(() => Promise.resolve());
  const pause = vi.fn();
  const createObjectURL = vi.fn(() => 'blob:intro');
  const revokeObjectURL = vi.fn();
  vi.stubGlobal('Audio', class { constructor(source) { this.src = source; this.currentTime = 0; this.play = play; this.pause = pause; } });
  vi.stubGlobal('URL', {...URL, createObjectURL, revokeObjectURL});
  try {
    const user = userEvent.setup(); const onEvent = vi.fn();
    render(<MiniQLab initialGroups={[{name: 'Act', cues: [{name: 'Play', type: 'audio', audioAction: 'play'}]}]} onEvent={onEvent} />);
    await user.upload(screen.getByLabelText('Audio track for cue 1'), new File(['sound'], 'intro.wav', {type: 'audio/wav'}));
    expect(screen.getByText('intro.wav')).toBeInTheDocument();
    await user.click(screen.getByRole('button', {name: 'GO Act'}));
    await waitFor(() => expect(play).toHaveBeenCalledOnce());
    expect(onEvent).not.toHaveBeenCalledWith(expect.objectContaining({type: 'cue:dispatched'}));
    expect(localStorage.getItem(TX_STORE_KEY)).toBeNull();
  } finally {
    vi.unstubAllGlobals();
  }
});

test('resizes cue columns, enforces minimums, persists, and resets defaults', async () => {
  render(<MiniQLab initialGroups={initialGroups} />);
  const handle = screen.getByRole('separator', {name: 'Resize Type / Content column'});
  pointer(handle, 'pointerdown', {clientX: 500, clientY: 10});
  pointer(window, 'pointermove', {clientX: 250, clientY: 10});
  pointer(window, 'pointerup', {clientX: 250, clientY: 10});
  expect(document.querySelector('col[data-column="content"]').style.width).toContain('300px');
  await waitFor(() => expect(JSON.parse(localStorage.getItem('mini-qlab-cue-column-widths')).content).toBe(300));
  fireEvent.doubleClick(handle);
  expect(document.querySelector('col[data-column="content"]').style.width).toContain('420px');
});

test('lets the Type / Content column fill the available table width', () => {
  render(<MiniQLab initialGroups={[{ name: 'Layout', cues: [{ number: '1', command: 'a/' }] }]} />);
  const table = document.querySelector('table');
  const content = document.querySelector('col[data-column="content"]');
  expect(table).toHaveStyle({width: '100%'});
  expect(table.style.minWidth).toBe('100%');
  expect(content.style.width).toBe('420px');
});

test('shows active cue panel and saves theme preference', async () => {
  const user = userEvent.setup(); render(<MiniQLab initialGroups={initialGroups} />);
  const logo = screen.getByRole('img', { name: 'decade.tw' });
  const goAll = screen.getByRole('button', { name: 'GO-ALL' });
  expect(logo.parentElement).toHaveClass('sm:w-[90%]');
  expect(screen.getByRole('heading', { name: 'Cue groups' }).closest('main')?.parentElement).toHaveClass('sm:w-[90%]');
  expect(goAll).toHaveClass('text-base', 'min-h-12');
  expect(screen.getByRole('heading', { name: 'Cue groups' })).toHaveClass('text-3xl');
  expect(logo).toHaveClass('dark:invert');
  expect(logo).not.toHaveStyle({filter: 'invert(100%)'});
  expect(goAll).toHaveClass('!bg-emerald-500', '!text-slate-950', 'dark:!text-white');
  expect(screen.getByRole('region', { name: 'Cue timeline' })).toHaveClass('bg-white', 'dark:bg-slate-950');
  expect(screen.getByLabelText('Timeline now time')).toHaveTextContent(/^NOW \d{2}:\d{2}:\d{2}\.\d{3}$/);
  expect(screen.getByLabelText('Timeline frames per second')).toHaveValue(30);
  expect(screen.getByLabelText('Timeline frames per second')).toHaveClass('h-10');
  await user.click(screen.getByRole('button', { name: 'Show active cues' }));
  expect(screen.getByRole('complementary', { name: 'Active cues' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Hide active cues' })).not.toHaveClass('toggle-bounce');
  expect(screen.getByTestId('active-cues-toggle-dot')).toHaveClass('toggle-bounce');
  // 默认主题为 dark（见 PAGEXQ.jsx），切换按钮为 "Use light theme"
  await user.click(screen.getByRole('button', { name: 'Use light theme' }));
  expect(localStorage.getItem('mini-qlab-theme')).toBe('light');
  expect(document.documentElement).not.toHaveClass('dark');
  expect(screen.getByRole('button', {name: 'Use dark theme'})).not.toHaveClass('toggle-bounce');
  expect(screen.getByTestId('theme-toggle-dot')).toHaveClass('toggle-bounce');
  fireEvent.animationEnd(screen.getByTestId('theme-toggle-dot'));
  expect(screen.getByTestId('theme-toggle-dot')).not.toHaveClass('toggle-bounce');
});

test('uses editable cue cards on phones and retains the table on desktop', async () => {
  const previousWidth = window.innerWidth;
  Object.defineProperty(window, 'innerWidth', {configurable: true, value: 390});
  try {
    const user = userEvent.setup();
    render(<MiniQLab initialGroups={initialGroups} />);
    expect(screen.getByTestId('mobile-cue-cards')).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', {name: /STATUS/})).not.toBeInTheDocument();
    const command = screen.getByLabelText('Command for cue 1');
    await user.clear(command);
    await user.type(command, 'mobile');
    await user.tab();
    expect(command).toHaveValue('mobile/');
  } finally {
    Object.defineProperty(window, 'innerWidth', {configurable: true, value: previousWidth});
  }
});

test('sets and resets an individual cue group background color', async () => {
  const user = userEvent.setup();
  render(<MiniQLab initialGroups={[...initialGroups, {name: 'Blue', cues: []}]} />);
  const actGroup = screen.getByRole('region', {name: 'Cue group Act'});
  await user.click(screen.getByLabelText('Background color for Act'));
  fireEvent.change(screen.getByLabelText('Background color for Act'), {target: {value: '#a1b2c3'}});
  expect(actGroup).toHaveStyle({backgroundColor: 'rgba(161, 178, 195, 0.094)'});
  expect(within(actGroup).getByTestId(/^color-swatch-/)).toHaveClass('toggle-bounce');
  expect(screen.getByRole('region', {name: 'Cue group Blue'})).not.toHaveStyle({backgroundColor: 'rgba(161, 178, 195, 0.094)'});
  await user.click(screen.getByRole('button', {name: 'Reset background color for Act'}));
  expect(actGroup).not.toHaveStyle({backgroundColor: 'rgba(161, 178, 195, 0.094)'});
});

test('disables boundary cue moves and duplicates a cue after itself', async () => {
  const user = userEvent.setup();
  render(<MiniQLab initialGroups={[{name: 'Act', cues: [{name: 'First', command: 'one/'}, {name: 'Last', command: 'two/'}]}]} />);
  expect(screen.getByRole('button', {name: 'Move cue 1 up'})).toBeDisabled();
  expect(screen.getByRole('button', {name: 'Move cue 1 up'})).toHaveClass('disabled:bg-slate-100');
  expect(screen.getByRole('button', {name: 'Move cue 1 up'})).toHaveClass('min-h-8', 'min-w-8');
  expect(screen.getByRole('button', {name: 'Move cue 2 down'})).toBeDisabled();
  await user.click(screen.getByRole('button', {name: 'Duplicate cue 1'}));
  expect(screen.getAllByLabelText(/Name for cue/)).toHaveLength(3);
});

test('shows a cue name and content on wide timeline clips', () => {
  render(<MiniQLab initialGroups={[{name: 'Act', cues: [{name: 'Lights up', command: 'lights/up', afterWaitMs: 3000}, {name: 'Jump', type: 'trigger', targetGroupName: 'Act', targetCueName: 'Lights up', afterWaitMs: 3000}]}]} />);
  expect(screen.getByRole('button', {name: 'Lights up timeline cue'})).toHaveTextContent('Lights uplights/up/');
  expect(screen.getByRole('button', {name: 'Jump timeline cue'})).toHaveTextContent('↪ JumpTrigger → Act / Lights up');
});

test('keeps current groups and announces invalid import', async () => {
  const user = userEvent.setup(); render(<MiniQLab initialGroups={initialGroups} />);
  await user.upload(screen.getByLabelText('Import cue groups'), new File(['{}'], 'cues.json', { type: 'application/json' }));
  expect(await screen.findByRole('status')).toHaveTextContent('Import failed');
  expect(screen.getByDisplayValue('Act')).toBeInTheDocument();
});

test('dispatches a matching received timecode only once per value', async () => {
  const onEvent = vi.fn();
  const { rerender } = render(<MiniQLab initialGroups={initialGroups} onEvent={onEvent} rxJson={{ TC: { string: '' } }} />);
  rerender(<MiniQLab initialGroups={initialGroups} onEvent={onEvent} rxJson={{ TC: { string: '01:00:00:00' } }} />);
  await waitFor(() => expect(onEvent).toHaveBeenCalledWith(expect.objectContaining({ type: 'cue:dispatched', source: 'timecode' })));
  expect(onEvent.mock.calls.filter(([event]) => event.source === 'timecode')).toHaveLength(1);
});

test('counts down before-wait, then dispatches and marks the cue DONE', async () => {
  const onEvent = vi.fn();
  render(<MiniQLab initialGroups={[{ name: 'Wait', cues: [{ number: '1', command: 'go/', beforeWaitMs: 200 }] }]} onEvent={onEvent} />);
  vi.useFakeTimers();
  try {
    act(() => { screen.getByRole('button', { name: 'GO Wait' }).click(); });
    expect(screen.getByText('LIVE')).toBeInTheDocument();
    await vi.advanceTimersByTimeAsync(90);
    expect(onEvent).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'cue:dispatched' }));
    await vi.advanceTimersByTimeAsync(220);
    expect(onEvent).toHaveBeenCalledWith(expect.objectContaining({ type: 'cue:dispatched', command: 'go/' }));
    expect(screen.getByText('DONE')).toBeInTheDocument();
  } finally { vi.useRealTimers(); }
});

test('reconciles an overdue hidden-tab cue and logs a warning', async () => {
  vi.useFakeTimers();
  try {
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    render(<MiniQLab initialGroups={[{name: 'Background', cues: [{name: 'Late cue', command: 'late/', beforeWaitMs: 100}]}]} />);
    act(() => { screen.getByRole('button', {name: 'GO Background'}).click(); });
    vi.setSystemTime(new Date('2026-01-01T00:00:00.350Z'));
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
      await Promise.resolve();
    });
    expect(screen.getByRole('list')).toHaveTextContent('warning');
    expect(screen.getByRole('list')).toHaveTextContent('Late 250ms · late/');
  } finally { vi.useRealTimers(); }
});

test('lists dispatched cues in the cue log with source and group', async () => {
  vi.useFakeTimers();
  vi.stubGlobal('requestAnimationFrame', () => 0);
  vi.stubGlobal('cancelAnimationFrame', () => {});
  try {
    render(<MiniQLab initialGroups={initialGroups} />);
    const command = screen.getByLabelText('Command for cue 1');
    fireEvent.change(command, {target: {value: 'logcue'}});
    fireEvent.blur(command);
    await act(() => { screen.getByRole('button', { name: 'GO Act' }).click(); });
    await vi.advanceTimersByTimeAsync(500);
  } finally { vi.useRealTimers(); vi.unstubAllGlobals(); }
  const log = screen.getByRole('list');
  expect(log).toBeInTheDocument();
  expect(log.textContent).toContain('sequence');
  expect(log.textContent).toContain('Act');
  expect(log.textContent).toContain('logcue/');
  expect(log.closest('section').textContent).toMatch(/\d+ EVENTS?/);
});

test('persists dispatched commands to the TX_JSON_CMD store', async () => {
  const onEvent = vi.fn();
  render(<MiniQLab initialGroups={[{ name: 'Store', cues: [{ number: '1', command: 'tx/', afterWaitMs: 100 }] }]} onEvent={onEvent} />);
  vi.useFakeTimers();
  try {
    act(() => { screen.getByRole('button', { name: 'GO Store' }).click(); });
    await vi.advanceTimersByTimeAsync(400);
    expect(onEvent).toHaveBeenCalledWith(expect.objectContaining({ type: 'cue:dispatched', command: 'tx/' }));
    const stored = JSON.parse(localStorage.getItem(TX_STORE_KEY));
    expect(stored).toMatchObject({ command: 'tx/' });
    expect(typeof stored.timestamp).toBe('string');
  } finally { vi.useRealTimers(); }
});

test('sends dispatched command entries over the configured websocket', async () => {
  localStorage.setItem('mini-qlab-ws', JSON.stringify({ enabled: false, host: '', port: '' }));
  const sent = [];
  class MockWebSocket {
    constructor(url) { this.url = url; this.readyState = 1; MockWebSocket.last = this; queueMicrotask(() => this.onopen?.()); }
    send(data) { if (data != null) sent.push(data); }
    close() { this.readyState = 3; this.onclose?.(); }
  }
  const OriginalWebSocket = globalThis.WebSocket;
  globalThis.WebSocket = MockWebSocket;
  try {
    const onEvent = vi.fn();
    render(<MiniQLab initialGroups={[{ name: 'WStore', cues: [{ number: '1', command: 'ws/', beforeWaitMs: 100 }] }]} onEvent={onEvent} />);
    const user = userEvent.setup();
    await user.click(screen.getByLabelText('Enable WebSocket'));
    await user.type(screen.getByLabelText('WebSocket host'), '127.0.0.1');
    await user.type(screen.getByLabelText('WebSocket port'), '9000');
    expect(MockWebSocket.last.url).toBe('ws://127.0.0.1:9000');
    await act(async () => {});
    await act(async () => {
      screen.getByRole('button', { name: 'GO WStore' }).click();
      await new Promise(resolve => setTimeout(resolve, 300));
    });
    expect(onEvent).toHaveBeenCalledWith(expect.objectContaining({ type: 'cue:dispatched', command: 'ws/' }));
    expect(sent.length).toBeGreaterThan(0);
    const entry = JSON.parse(sent.at(-1));
    expect(entry).toMatchObject({ command: 'ws/' });
    expect(typeof entry.timestamp).toBe('string');
    const wsPanel = screen.getByRole('region', {name: 'WebSocket panel'});
    expect(within(wsPanel).getByRole('list', {name: 'WebSocket event log'})).toHaveTextContent('sent');
    expect(within(wsPanel).getByRole('list', {name: 'WebSocket event log'})).toHaveTextContent('ws/');
    expect(within(screen.getByRole('region', {name: 'Cue log'})).queryByLabelText('Enable WebSocket')).not.toBeInTheDocument();
  } finally {
    globalThis.WebSocket = OriginalWebSocket;
  }
});

test('receives WebSocket cue controls for every matching cue name', async () => {
  localStorage.setItem('mini-qlab-ws', JSON.stringify({enabled: true, host: '127.0.0.1', port: '9001'}));
  class MockWebSocket {
    constructor() { this.readyState = 1; MockWebSocket.last = this; queueMicrotask(() => this.onopen?.()); }
    close() { this.readyState = 3; this.onclose?.(); }
  }
  const OriginalWebSocket = globalThis.WebSocket;
  globalThis.WebSocket = MockWebSocket;
  try {
    const onEvent = vi.fn();
    render(<MiniQLab initialGroups={[
      {name: 'One', cues: [{name: 'Flash', command: 'one/'}]},
      {name: 'Two', cues: [{name: 'flash', command: 'two/'}]}
    ]} onEvent={onEvent}/>);
    await act(async () => {});
    act(() => MockWebSocket.last.onmessage({data: '{"command":"/cue/Flash/start"}'}));
    expect(onEvent.mock.calls.filter(([event]) => event.type === 'cue:dispatched' && event.source === 'websocket').map(([event]) => event.command)).toEqual(['one/', 'two/']);
    const wsPanel = screen.getByRole('region', {name: 'WebSocket panel'});
    expect(within(wsPanel).getByRole('list', {name: 'WebSocket event log'})).toHaveTextContent('received');
    expect(screen.getByRole('region', {name: 'Cue log'})).toHaveTextContent('WebSocket started 2 cues named Flash.');
    act(() => MockWebSocket.last.onmessage({data: '/cue/Missing/stop'}));
    expect(screen.getByRole('region', {name: 'Cue log'})).toHaveTextContent('No cue named Missing found.');
  } finally { globalThis.WebSocket = OriginalWebSocket; }
});

test('stops only matching WebSocket single-cue runs', async () => {
  localStorage.setItem('mini-qlab-ws', JSON.stringify({enabled: true, host: '127.0.0.1', port: '9002'}));
  class MockWebSocket {
    constructor() { this.readyState = 1; MockWebSocket.last = this; }
    close() { this.readyState = 3; this.onclose?.(); }
  }
  const OriginalWebSocket = globalThis.WebSocket;
  globalThis.WebSocket = MockWebSocket;
  vi.useFakeTimers();
  vi.stubGlobal('requestAnimationFrame', () => 0);
  vi.stubGlobal('cancelAnimationFrame', () => {});
  try {
    const onEvent = vi.fn();
    render(<MiniQLab initialGroups={[
      {name: 'One', cues: [{name: 'Flash', command: 'one/', beforeWaitMs: 100}]},
      {name: 'Two', cues: [{name: 'Flash', command: 'two/', beforeWaitMs: 100}]}
    ]} onEvent={onEvent}/>);
    act(() => MockWebSocket.last.onmessage({data: '/cue/Flash/start'}));
    act(() => MockWebSocket.last.onmessage({data: '/cue/Flash/stop'}));
    await vi.advanceTimersByTimeAsync(200);
    expect(onEvent).not.toHaveBeenCalledWith(expect.objectContaining({type: 'cue:dispatched', source: 'websocket'}));
    expect(screen.getByRole('region', {name: 'Cue log'})).toHaveTextContent('WebSocket stopped 2 cues named Flash.');
  } finally {
    vi.useRealTimers(); vi.unstubAllGlobals(); globalThis.WebSocket = OriginalWebSocket;
  }
});

test('collapses timeline content and persists the panel state', async () => {
  const user = userEvent.setup();
  const view = render(<MiniQLab initialGroups={initialGroups} />);
  expect(screen.getByTestId('timeline-scroll')).toBeInTheDocument();
  await user.click(screen.getByRole('button', {name: 'Collapse cue timeline'}));
  expect(screen.queryByTestId('timeline-scroll')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', {name: 'Welcome timeline cue'})).not.toBeInTheDocument();
  expect(localStorage.getItem('mini-qlab-timeline-collapsed')).toBe('true');
  view.unmount();
  render(<MiniQLab initialGroups={initialGroups} />);
  expect(screen.getByRole('button', {name: 'Expand cue timeline'})).toBeInTheDocument();
  expect(screen.queryByTestId('timeline-scroll')).not.toBeInTheDocument();
});

test('collapses and restores the isolated WebSocket event log', async () => {
  const user = userEvent.setup();
  const view = render(<MiniQLab initialGroups={initialGroups} />);
  const panel = screen.getByRole('region', {name: 'WebSocket panel'});
  expect(within(panel).getByText('No WebSocket events yet')).toBeInTheDocument();
  await user.click(within(panel).getByRole('button', {name: 'Collapse WebSocket panel'}));
  expect(within(panel).queryByText('No WebSocket events yet')).not.toBeInTheDocument();
  expect(localStorage.getItem('mini-qlab-ws-panel-collapsed')).toBe('true');
  view.unmount();
  render(<MiniQLab initialGroups={initialGroups} />);
  expect(screen.getByRole('button', {name: 'Expand WebSocket panel'})).toBeInTheDocument();
});

test('shows the next clock run for a valid cron and a warning for an invalid one', () => {
  vi.useFakeTimers();
  try {
    vi.setSystemTime(new Date('2026-09-03T00:00:00'));
    render(<MiniQLab initialGroups={[{ name: 'Clock', clockEnabled: true, cues: [{ number: '1', command: 'a/', cron: '* * * * * *' }, { number: '2', command: 'b/', cron: 'not a cron' }] }]} />);
    const pad = value => String(value).padStart(2, '0');
    const seconds = new Date().getSeconds() + 1;
    const expected = `next ${pad(new Date().getHours())}:${pad(new Date().getMinutes())}:${pad(seconds >= 60 ? 0 : seconds)}`;
    expect(screen.getByText(expected)).toBeInTheDocument();
    expect(screen.getByText('invalid cron')).toBeInTheDocument();
  } finally { vi.useRealTimers(); }
});

test('hides trigger columns until their group modes are enabled', () => {
  render(<MiniQLab initialGroups={[{ name: 'Modes', cues: [{ number: '1', command: 'a/' }] }]} />);
  expect(screen.queryByRole('columnheader', { name: 'HKey.' })).not.toBeInTheDocument();
  expect(screen.queryByRole('columnheader', { name: 'LTC Trigger' })).not.toBeInTheDocument();
  expect(screen.queryByRole('columnheader', { name: 'Clock' })).not.toBeInTheDocument();
});

test('opens a friendly Clock schedule dialog and applies an every-second preset', async () => {
  const user = userEvent.setup();
  render(<MiniQLab initialGroups={[{ name: 'Clock', clockEnabled: true, cues: [{ number: '1', command: 'a/' }] }]} />);
  await user.click(screen.getByLabelText('Cron for cue 1'));
  const dialog = screen.getByRole('dialog', { name: 'Clock schedule' });
  expect(dialog).toBeInTheDocument();
  await user.selectOptions(within(dialog).getByLabelText('Schedule frequency'), 'every-second');
  await user.click(within(dialog).getByRole('button', { name: 'Apply schedule' }));
  expect(screen.getByLabelText('Cron for cue 1')).toHaveValue('* * * * * *');
});

test('parses a directly typed cron expression in realtime', async () => {
  const user = userEvent.setup();
  render(<MiniQLab initialGroups={[{ name: 'Clock', clockEnabled: true, cues: [{ number: '1', command: 'a/' }] }]} />);
  await user.click(screen.getByLabelText('Cron for cue 1'));
  const dialog = screen.getByRole('dialog', { name: 'Clock schedule' });
  await user.selectOptions(within(dialog).getByLabelText('Schedule frequency'), 'custom');
  const expression = within(dialog).getByLabelText('Custom cron expression');
  await user.clear(expression);
  await user.type(expression, '* * * * * *');
  expect(within(dialog).getByText(/Valid cron expression/)).toBeInTheDocument();
  expect(within(dialog).getByText(/Next run:/)).toBeInTheDocument();
  await user.clear(expression);
  await user.type(expression, 'not a cron');
  expect(within(dialog).getByText(/Invalid cron expression/)).toBeInTheDocument();
});

test('syncs cue group colors into the timeline row and clips', () => {
  render(<MiniQLab initialGroups={[{ name: 'Color track', backgroundColor: '#123456', cues: [{ name: 'Colored', command: 'a/' }] }]} />);
  const track = document.querySelector('[data-timeline-track]');
  expect(track).toHaveStyle({backgroundColor: '#123456'});
  expect(screen.getByRole('button', {name: 'Colored timeline cue'})).toHaveStyle({backgroundColor: '#123456'});
});

test('creates a cron expression for an arbitrary interval', async () => {
  const user = userEvent.setup();
  render(<MiniQLab initialGroups={[{ name: 'Clock', clockEnabled: true, cues: [{ number: '1', command: 'a/' }] }]} />);
  await user.click(screen.getByLabelText('Cron for cue 1'));
  const dialog = screen.getByRole('dialog', { name: 'Clock schedule' });
  await user.selectOptions(within(dialog).getByLabelText('Schedule frequency'), 'interval');
  await user.clear(within(dialog).getByLabelText('Interval amount'));
  await user.type(within(dialog).getByLabelText('Interval amount'), '10');
  await user.selectOptions(within(dialog).getByLabelText('Interval unit'), 'seconds');
  await user.click(within(dialog).getByRole('button', { name: 'Apply schedule' }));
  expect(screen.getByLabelText('Cron for cue 1')).toHaveValue('*/10 * * * * *');
});

test('builds a full cron expression from named cron fields', async () => {
  const user = userEvent.setup();
  render(<MiniQLab initialGroups={[{ name: 'Clock', clockEnabled: true, cues: [{ number: '1', command: 'a/' }] }]} />);
  await user.click(screen.getByLabelText('Cron for cue 1'));
  const dialog = screen.getByRole('dialog', { name: 'Clock schedule' });
  const minutes = within(dialog).getByLabelText('Cron minutes');
  await user.clear(minutes);
  await user.type(minutes, '*/15');
  expect(within(dialog).getByLabelText('Custom cron expression')).toHaveValue('* */15 * * * *');
  expect(within(dialog).getByText(/Valid cron expression/)).toBeInTheDocument();
  await user.click(within(dialog).getByRole('button', { name: 'Apply schedule' }));
  expect(screen.getByLabelText('Cron for cue 1')).toHaveValue('* */15 * * * *');
});

test('keeps timeline timing synchronized with the cue table', async () => {
  const user = userEvent.setup();
  render(<MiniQLab initialGroups={[{name: 'Track', cues: [{name: 'First', command: 'first/', beforeWaitMs: 200, afterWaitMs: 500}]}]} />);
  const cue = screen.getByRole('button', {name: 'First timeline cue'});
  expect(cue).toHaveStyle({left: '16px', width: '50px'});
  const before = screen.getByLabelText('Before-wait for cue 1');
  await user.clear(before);
  await user.type(before, '1000');
  expect(cue).toHaveStyle({left: '80px'});
});

test('drags and resizes timeline cues through the shared timing state', () => {
  render(<MiniQLab initialGroups={[{name: 'Track', cues: [{name: 'First', command: 'first/', beforeWaitMs: 200, afterWaitMs: 500}]}]} />);
  const cue = screen.getByRole('button', {name: 'First timeline cue'});
  pointer(cue, 'pointerdown', {clientX: 100, clientY: 20});
  pointer(window, 'pointermove', {clientX: 180, clientY: 20});
  pointer(window, 'pointermove', {clientX: 180, clientY: 20});
  pointer(window, 'pointerup', {clientX: 180, clientY: 20});
  expect(screen.getByLabelText('Before-wait for cue 1')).toHaveValue(1200);

  pointer(screen.getByRole('separator', {name: 'Resize First'}), 'pointerdown', {clientX: 100, clientY: 20});
  pointer(window, 'pointermove', {clientX: 140, clientY: 20});
  pointer(window, 'pointerup', {clientX: 140, clientY: 20});
  expect(screen.getByLabelText('After-wait for cue 1')).toHaveValue(1000);
});

test('reorders a timeline cue only inside its group', () => {
  render(<MiniQLab initialGroups={[{name: 'Track', cues: [
    {name: 'First', command: 'first/', afterWaitMs: 500},
    {name: 'Second', command: 'second/', afterWaitMs: 500}
  ]}]} />);
  const first = screen.getByRole('button', {name: 'First timeline cue'});
  pointer(first, 'pointerdown', {clientX: 10, clientY: 20});
  pointer(window, 'pointermove', {clientX: 10, clientY: 60});
  pointer(window, 'pointermove', {clientX: 1000, clientY: 60});
  pointer(window, 'pointerup', {clientX: 1000, clientY: 60});
  expect(screen.getAllByLabelText(/Command for cue/).map(input => input.value)).toEqual(['second/', 'first/']);
});

test('right-clicks empty timeline space to add a full cue draft', async () => {
  const user = userEvent.setup();
  render(<MiniQLab initialGroups={[{name: 'Track', hotkeyEnabled: true, cues: []}]} />);
  const track = document.querySelector('[data-timeline-track]');
  Object.defineProperty(track, 'getBoundingClientRect', {value: () => ({left: 0})});
  fireEvent.contextMenu(track, {clientX: 160, clientY: 80});
  const dialog = screen.getByRole('dialog', {name: 'Add cue'});
  expect(dialog).toBeInTheDocument();
  expect(within(dialog).getByLabelText('After-wait (ms)')).toHaveValue(1000);
  await user.type(within(dialog).getByLabelText('Command'), 'new-cue');
  await user.type(within(dialog).getByLabelText('Hotkey'), 'ab');
  await user.click(screen.getByRole('button', {name: 'Save'}));
  expect(screen.getByLabelText('Command for cue 1')).toHaveValue('new-cue/');
  expect(screen.getByLabelText('Hotkey for cue 1')).toHaveValue('a');
});

test('right-clicks a cue to modify all content or remove it', async () => {
  const user = userEvent.setup();
  render(<MiniQLab initialGroups={[{name: 'Track', cues: [{name: 'Old', command: 'old/', afterWaitMs: 500}]}]} />);
  fireEvent.contextMenu(screen.getByRole('button', {name: 'Old timeline cue'}), {clientX: 100, clientY: 80});
  await user.clear(screen.getByLabelText('Command'));
  await user.type(screen.getByLabelText('Command'), 'changed');
  await user.clear(screen.getByLabelText('After-wait (ms)'));
  await user.type(screen.getByLabelText('After-wait (ms)'), '1200');
  await user.click(screen.getByRole('button', {name: 'Save'}));
  expect(screen.getByLabelText('Command for cue 1')).toHaveValue('changed/');
  expect(screen.getByLabelText('After-wait for cue 1')).toHaveValue(1200);

  fireEvent.contextMenu(screen.getByRole('button', {name: 'Old timeline cue'}), {clientX: 100, clientY: 80});
  await user.click(screen.getByRole('button', {name: 'Remove'}));
  expect(screen.queryByLabelText('Command for cue 1')).not.toBeInTheDocument();
});

test('left-drags empty space to pan and uses the wheel to zoom', () => {
  render(<MiniQLab initialGroups={[{name: 'Track', cues: []}]} />);
  const scroller = screen.getByTestId('timeline-scroll');
  const track = document.querySelector('[data-timeline-track]');
  scroller.scrollLeft = 500;
  pointer(track, 'pointerdown', {clientX: 300, clientY: 80});
  pointer(window, 'pointermove', {clientX: 100, clientY: 80});
  pointer(window, 'pointerup', {clientX: 100, clientY: 80});
  expect(scroller.scrollLeft).toBe(700);
  const wheel = new Event('wheel', {bubbles: true, cancelable: true});
  Object.defineProperties(wheel, {clientX: {value: 200}, deltaY: {value: -100}});
  act(() => { scroller.dispatchEvent(wheel); });
  expect(wheel.defaultPrevented).toBe(true);
  expect(screen.getByText('81px/s')).toBeInTheDocument();
});

test('always shows independent playheads and loop boundary markers', () => {
  render(<MiniQLab initialGroups={[
    {name: 'Looped', loopEnabled: true, cues: [{number: '1', command: 'a/', afterWaitMs: 1000}]},
    {name: 'Plain', cues: [{number: '1', command: 'b/', afterWaitMs: 500}]}
  ]} />);
  expect(screen.getByLabelText('Playhead for Looped')).toHaveAttribute('data-playhead-ms', '0');
  expect(screen.getByLabelText('Playhead for Plain')).toHaveAttribute('data-playhead-ms', '0');
  expect(screen.getByLabelText('Loop start for Looped')).toHaveStyle({left: '0px'});
  expect(screen.getByLabelText('Loop end for Looped')).toHaveStyle({left: '80px'});
  expect(screen.queryByLabelText('Loop start for Plain')).not.toBeInTheDocument();
});

test('trigger cue starts an idle target group from the named cue', async () => {
  const onEvent = vi.fn();
  render(<MiniQLab onEvent={onEvent} initialGroups={[
    {name: 'Source', cues: [{name: 'Link', type: 'trigger', targetGroupName: 'Target', targetCueName: 'Middle'}]},
    {name: 'Target', cues: [{name: 'First', command: 'first/'}, {name: 'Middle', command: 'middle/'}, {name: 'Last', command: 'last/'}]}
  ]} />);
  await act(() => { screen.getByRole('button', {name: 'GO Source'}).click(); });
  await waitFor(() => expect(onEvent).toHaveBeenCalledWith(expect.objectContaining({type: 'cue:target-result', result: 'started'})));
  expect(onEvent.mock.calls.filter(([event]) => event.type === 'cue:dispatched').map(([event]) => event.command)).toEqual(['middle/', 'last/']);
  expect(screen.getByRole('list')).toHaveTextContent('Started Target from Middle');
});

test('trigger cue ignores a running target and writes a warning', async () => {
  render(<MiniQLab initialGroups={[
    {name: 'Source', cues: [{name: 'Link', type: 'trigger', targetGroupName: 'Target', targetCueName: 'Wait'}]},
    {name: 'Target', cues: [{name: 'Wait', command: 'wait/', beforeWaitMs: 1000}]}
  ]} />);
  act(() => { screen.getByRole('button', {name: 'GO Target'}).click(); });
  act(() => { screen.getByRole('button', {name: 'GO Source'}).click(); });
  expect(await screen.findByRole('list')).toHaveTextContent('already running');
  expect(screen.getByText('warning')).toBeInTheDocument();
});
