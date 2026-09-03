import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import MiniQLab from '../src/PAGEXQ.jsx';

const initialGroups = [{ name: 'Act', cues: [{ number: '1', command: '', waitMs: 0, hotkey: 'g', ltcTrigger: '01:00:00:00' }], hotkeyEnabled: true, timecodeEnabled: true }];

test('normalizes an edited command and dispatches it through onEvent', async () => {
  const user = userEvent.setup(); const onEvent = vi.fn();
  render(<MiniQLab initialGroups={initialGroups} onEvent={onEvent} />);
  const command = screen.getByLabelText('Command for cue 1');
  await user.type(command, 'lights'); await user.tab();
  expect(command).toHaveValue('lights/');
  await user.click(screen.getByRole('button', { name: 'GO Act' }));
  await waitFor(() => expect(onEvent).toHaveBeenCalledWith(expect.objectContaining({ type: 'cue:dispatched', command: 'lights/', source: 'sequence' })));
});

test('shows active cue panel and saves theme preference', async () => {
  const user = userEvent.setup(); render(<MiniQLab initialGroups={initialGroups} />);
  await user.click(screen.getByRole('button', { name: 'Show active cues' }));
  expect(screen.getByRole('complementary', { name: 'Active cues' })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Use dark theme' }));
  expect(localStorage.getItem('mini-qlab-theme')).toBe('dark');
  expect(document.documentElement).toHaveClass('dark');
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
