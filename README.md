# use-key-match

> A powerful React hook for mapping keyboard events to callbacks with intuitive pattern matching

[![CI](https://github.com/ArturJS/use-key-match/actions/workflows/ci.yml/badge.svg)](https://github.com/ArturJS/use-key-match/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/use-key-match.svg)](https://badge.fury.io/js/use-key-match)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## Features

- 🎯 **Intuitive Pattern Matching** - Use simple strings like `'Ctrl+S'` or `'EnterOrSpace'`
- 🖥️ **Cross-Platform** - `CmdOrCtrl` automatically uses Cmd on macOS, Ctrl elsewhere
- 🔄 **Multiple Key Alternatives** - `'EnterOrSpace'` matches either Enter or Space
- ⚡ **Performance Optimized** - Efficient event handling with automatic cleanup
- 🎮 **Rich Modifier Support** - Ctrl, Alt, Shift, Meta, and platform-specific aliases
- 🔒 **TypeScript Ready** - Full type safety and IntelliSense support
- 🪝 **React Hooks** - Modern React patterns with automatic lifecycle management

## Installation

```bash
npm install use-key-match
# or
yarn add use-key-match
# or
pnpm add use-key-match
```

## Quick Start

```tsx
import React from 'react';
import { useKeyMatch } from 'use-key-match';

function App() {
  useKeyMatch({
    'Ctrl+S': () => console.log('Save triggered!'),
    'Escape': () => console.log('Escape pressed!'),
    'EnterOrSpace': () => console.log('Submit action!')
  });

  return <div>Press Ctrl+S, Escape, or Enter/Space</div>;
}
```

## Basic Examples

### Simple Key Handling

```tsx
import { useKeyMatch } from 'use-key-match';

function DocumentEditor() {
  useKeyMatch({
    // Single keys
    'Enter': () => submitForm(),
    'Escape': () => closeModal(),
    'Delete': () => deleteSelected(),
    
    // Arrow keys (normalized)
    'ArrowUp': () => moveUp(),
    'ArrowDown': () => moveDown(),
    
    // Special keys
    'Space': () => togglePlayPause(),
    'Tab': () => focusNext()
  });

  return <div>/* Your component */</div>;
}
```

### Modifier Key Combinations

```tsx
function TextEditor() {
  useKeyMatch({
    // Ctrl combinations
    'Ctrl+S': () => saveDocument(),
    'Ctrl+Z': () => undo(),
    'Ctrl+Y': () => redo(),
    'Ctrl+A': () => selectAll(),
    
    // Shift combinations
    'Shift+Tab': () => focusPrevious(),
    'Shift+Delete': () => permanentDelete(),
    
    // Alt combinations
    'Alt+F4': () => closeApplication(),
    'Alt+Tab': () => switchWindow(),
    
    // Multiple modifiers
    'Ctrl+Shift+Z': () => redo(),
    'Ctrl+Alt+Delete': () => taskManager()
  });

  return <textarea placeholder="Type here..." />;
}
```

## Advanced Examples

### Cross-Platform Shortcuts

```tsx
function CrossPlatformApp() {
  useKeyMatch({
    // Uses Cmd on macOS, Ctrl on Windows/Linux
    'CmdOrCtrl+S': () => save(),
    'CmdOrCtrl+O': () => open(),
    'CmdOrCtrl+N': () => newDocument(),
    'CmdOrCtrl+W': () => closeTab(),
    
    // Alternative syntax
    'CommandOrControl+Q': () => quit(),
    
    // macOS specific (Option key)
    'Option+Left': () => moveWordLeft(),
    'Option+Right': () => moveWordRight()
  });

  return <div>Cross-platform shortcuts work everywhere!</div>;
}
```

### Multiple Key Alternatives

```tsx
function FormWithFlexibleSubmit() {
  const [value, setValue] = useState('');

  useKeyMatch({
    // Either Enter or Space submits the form
    'EnterOrSpace': () => {
      if (value.trim()) {
        submitForm(value);
      }
    },
    
    // Either Escape or Ctrl+C cancels
    'EscapeOrCtrl+C': () => cancelForm(),
    
    // Multiple alternatives with modifiers
    'Ctrl+EnterOrSpace': () => submitAndContinue(),
    
    // Three or more alternatives
    'EnterOrSpaceOrTab': () => advanceToNext()
  });

  return (
    <input 
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Press Enter or Space to submit"
    />
  );
}
```

### Game Controls

```tsx
function GameComponent() {
  const [player, setPlayer] = useState({ x: 0, y: 0 });

  useKeyMatch({
    // WASD movement
    'W': () => setPlayer(p => ({ ...p, y: p.y - 1 })),
    'A': () => setPlayer(p => ({ ...p, x: p.x - 1 })),
    'S': () => setPlayer(p => ({ ...p, y: p.y + 1 })),
    'D': () => setPlayer(p => ({ ...p, x: p.x + 1 })),
    
    // Arrow key movement
    'ArrowUp': () => setPlayer(p => ({ ...p, y: p.y - 1 })),
    'ArrowDown': () => setPlayer(p => ({ ...p, y: p.y + 1 })),
    'ArrowLeft': () => setPlayer(p => ({ ...p, x: p.x - 1 })),
    'ArrowRight': () => setPlayer(p => ({ ...p, x: p.x + 1 })),
    
    // Actions
    'Space': () => jump(),
    'EnterOrSpace': () => interact(),
    'Shift': () => run(),
    'Ctrl': () => crouch()
  });

  return (
    <div>
      <div>Player position: ({player.x}, {player.y})</div>
      <div>Use WASD or Arrow keys to move</div>
    </div>
  );
}
```

### Modal Dialog with Keyboard Navigation

```tsx
function Modal({ isOpen, onClose, onConfirm }) {
  useKeyMatch({
    'Escape': () => {
      if (isOpen) onClose();
    },
    'Enter': () => {
      if (isOpen) onConfirm();
    },
    'Tab': () => {
      // Handle tab navigation within modal
      focusNextElement();
    },
    'Shift+Tab': () => {
      focusPreviousElement();
    }
  });

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Confirm Action</h2>
        <p>Are you sure you want to proceed?</p>
        <button onClick={onConfirm}>Confirm (Enter)</button>
        <button onClick={onClose}>Cancel (Escape)</button>
      </div>
    </div>
  );
}
```

### Complex Application Example

```tsx
function AdvancedApp() {
  const [mode, setMode] = useState('normal');
  const [clipboard, setClipboard] = useState('');

  useKeyMatch({
    // File operations
    'CmdOrCtrl+N': () => createNew(),
    'CmdOrCtrl+O': () => openFile(),
    'CmdOrCtrl+S': () => saveFile(),
    'CmdOrCtrl+Shift+S': () => saveAs(),
    
    // Edit operations
    'CmdOrCtrl+C': () => copy(),
    'CmdOrCtrl+V': () => paste(),
    'CmdOrCtrl+X': () => cut(),
    'CmdOrCtrl+Z': () => undo(),
    'CmdOrCtrl+Y': () => redo(),
    
    // View operations
    'CmdOrCtrl+Plus': () => zoomIn(),
    'CmdOrCtrl+Minus': () => zoomOut(),
    'CmdOrCtrl+0': () => resetZoom(),
    
    // Mode switching
    'I': () => setMode('insert'),
    'V': () => setMode('visual'),
    'Escape': () => setMode('normal'),
    
    // Quick actions
    'F1': () => showHelp(),
    'F5': () => refresh(),
    'F11': () => toggleFullscreen(),
    
    // Multi-key alternatives for accessibility
    'CmdOrCtrl+EnterOrSpace': () => quickSubmit(),
    'EscapeOrCtrl+C': () => emergencyExit()
  });

  return (
    <div>
      <div>Current mode: {mode}</div>
      <div>Use keyboard shortcuts for faster workflow!</div>
    </div>
  );
}
```

## API Reference

### `useKeyMatch(callbacks: Record<string, () => void>): void`

The main hook that registers keyboard event listeners.

**Parameters:**
- `callbacks`: An object where keys are keyboard patterns and values are callback functions

**Pattern Syntax:**

| Pattern | Description | Example |
|---------|-------------|---------|
| `'a'` | Single key | Any letter, number, or named key |
| `'Ctrl+S'` | Modifier + Key | Ctrl, Alt, Shift, Meta + any key |
| `'CmdOrCtrl+S'` | Cross-platform | Cmd on macOS, Ctrl elsewhere |
| `'EnterOrSpace'` | Multiple alternatives | Matches any of the specified keys |
| `'Ctrl+EnterOrSpace'` | Modifier + alternatives | Modifier applies to all alternatives |

**Supported Modifiers:**
- `Ctrl`, `Control` - Control key
- `Alt` - Alt key  
- `Shift` - Shift key
- `Meta`, `Cmd`, `Command` - Command/Windows key
- `Super` - Alias for Meta
- `Option` - Alt key on macOS only
- `CmdOrCtrl`, `CommandOrControl` - Cross-platform modifier

**Normalized Key Names:**
- `Space` (for spacebar)
- `Up`, `Down`, `Left`, `Right` (for arrow keys)
- `Enter`, `Escape`, `Tab`, `Delete`, `Backspace`
- All letter and number keys work as expected

## Browser Support

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## Requirements

- React ≥16.8.0 (for hooks support)
- TypeScript ≥4.0 (if using TypeScript)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests (`npm test`)
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build the library
npm run build

# Start development mode
npm run dev

# Run demo
npm run demo
```

## License

MIT © [ArturJS]
