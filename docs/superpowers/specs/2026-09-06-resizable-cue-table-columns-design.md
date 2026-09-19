# Resizable Cue Table Columns

## Goal

Let users adjust every cue-table column width and reduce the oversized default Type / Content column.

## Interaction

- Add a visible resize handle to the right edge of each column header.
- Pointer-dragging a handle changes only that column's width.
- Double-clicking a handle restores that column's default width.
- Resizing does not select header text or trigger cue-row actions.
- Handles have accessible labels identifying their column.

## Sizing

- Define a default width and practical minimum width for each column.
- Type / Content starts substantially narrower than its current 48rem minimum while still fitting the command layout.
- Trigger controls remain in one three-column row inside the resized Type / Content cell and compress within their minimum usable widths.
- The table uses explicit column widths and retains horizontal scrolling when their combined width exceeds the panel.

## Persistence and Sharing

- Store column widths in local storage.
- All cue groups share the same column-width configuration so headers remain aligned and resizing any group updates every group.
- Ignore missing, invalid, or below-minimum persisted values and fall back to defaults.

## Architecture

- `PAGEXQ` owns the shared persisted column-width state.
- `CueGroup` passes widths and resize callbacks to `CueTable`.
- `CueTable` renders a `colgroup`, header handles, and the pointer drag behavior.
- Cue data, command behavior, playback, ordering, and timeline timing remain unchanged.

## Verification

- Test pointer resizing, minimum-width enforcement, shared widths, persistence, and double-click reset.
- Run the complete test suite and production build.
- Inspect default, resized, and horizontally scrolled layouts at desktop and narrow widths.

