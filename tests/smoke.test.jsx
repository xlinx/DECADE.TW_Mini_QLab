import React from 'react';
import { render, screen } from '@testing-library/react';
import MiniQLab from '../src/PAGEXQ.jsx';

test('renders the global cue controls', () => {
  render(<MiniQLab />);
  expect(screen.getByRole('button', { name: 'GO-ALL' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'STOP-ALL' })).toBeInTheDocument();
});
