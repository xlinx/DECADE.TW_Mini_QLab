# Tailwind UI Migration Design

## Goal

Replace Ant Design and its icon packages with Tailwind CSS while preserving
Mini QLab's existing cue-management behavior and general screen layout. The
application must run through Vite without importing an Ant Design package.

## Scope

The migration covers the UI layers in `PAGEXQ.jsx` and `MiniQ.jsx`:

- Page and cue-group layout
- Buttons, tags, fields, switches, panels, tables, progress displays, and
  dialogs
- File import/export controls and user feedback
- Icons used by the controls

It does not change cue execution, cron handling, state shape, local-storage
keys, or the application data flow.

## Architecture

Tailwind CSS provides all visual styling. Native React and HTML elements
provide component behavior; no replacement component framework is introduced.

Create a small local UI primitive layer for repeated semantics:

- `Button`, including solid, outline, danger, and icon-only variants
- `Badge` for status and group labels
- `Field`, `NumberField`, and `Toggle`
- `Panel` and `CollapsiblePanel`
- `Dialog` and `Toast`
- `DataTable` with native table markup and responsive overflow

The primitives expose only the props needed by the current application. They
use Tailwind class composition and remain colocated under `src/components/ui`.
`PAGEXQ.jsx` and `MiniQ.jsx` consume the primitives instead of framework
components. `lucide-react` supplies icons, keeping icon semantics explicit
without adding a UI framework.

## Data Flow and Behavior Preservation

Existing component props and Zustand state remain unchanged. Native event
handlers replace Ant Design callbacks while preserving their outcomes:

- Group controls still create, reorder, edit, and delete groups.
- Cue controls retain their current actions, state changes, and keyboard/time
  behavior.
- Import controls use a hidden native file input and pass the selected file to
  the existing JSON import logic.
- Feedback uses the local toast primitive instead of Ant Design's message API.
- Popconfirm behavior becomes a local accessible confirmation dialog.

All tables render their existing data and actions using responsive native
tables. Horizontal overflow is retained where required on narrow viewports.

## Dependency and Build Changes

Add Tailwind CSS and its Vite integration. Add `lucide-react` for icons.
Remove `antd`, `@ant-design/icons`, `antd-mobile-icons`, and `antd-style` from
`package.json`, then regenerate `package-lock.json` with npm. Remove all
related imports and references, including README installation instructions.

## Error Handling and Accessibility

File parsing errors appear as dismissible toast messages. Destructive actions
require explicit confirmation. Icon-only controls include accessible labels.
Native labels, buttons, inputs, and keyboard-focus styles are used throughout.

## Verification

The migration is accepted when:

1. `npm test` starts Vite and compiles the React entry plus both main JSX
   modules.
2. The browser-loaded application has no unresolved imports or runtime errors
   during the primary cue-list interaction path.
3. `rg` finds no imports or package dependencies for the removed Ant Design
   packages.
4. Tailwind styles load and the main cue/group layout remains usable at desktop
   and narrow viewport widths.
