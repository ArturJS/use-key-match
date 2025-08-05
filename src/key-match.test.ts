import { test, describe } from 'bun:test';
import { expect } from 'bun:test';
import { keyMatch } from './key-match';

// Mock KeyboardEvent since we're in Node.js environment
function createKeyboardEvent({
  key,
  ctrlKey = false,
  altKey = false,
  shiftKey = false,
  metaKey = false
}: {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
}) {
  return {
    key,
    ctrlKey,
    altKey,
    shiftKey,
    metaKey
  };
}

// Mock navigator for platform detection
(global as any).navigator = {
  platform: 'Win32' // Default to Windows for testing
};

describe('keyMatch', () => {
  describe('single key matching', () => {
    test('should match simple letter keys', () => {
      const event = createKeyboardEvent({ key: 'a' });
      expect(keyMatch(event as KeyboardEvent, 'a')).toBe(true);
      expect(keyMatch(event as KeyboardEvent, 'A')).toBe(true); // case insensitive
      expect(keyMatch(event as KeyboardEvent, 'b')).toBe(false);
    });

    test('should match special keys', () => {
      expect(
        keyMatch(createKeyboardEvent({ key: 'Enter' }) as KeyboardEvent, 'enter')
      ).toBe(true);
      expect(
        keyMatch(createKeyboardEvent({ key: 'Escape' }) as KeyboardEvent, 'escape')
      ).toBe(true);
    });

    test('should normalize space key', () => {
      expect(
        keyMatch(createKeyboardEvent({ key: ' ' }) as KeyboardEvent, 'space')
      ).toBe(true);
    });

    test('should normalize arrow keys', () => {
      expect(
        keyMatch(createKeyboardEvent({ key: 'ArrowUp' }) as KeyboardEvent, 'up')
      ).toBe(true);
      expect(
        keyMatch(createKeyboardEvent({ key: 'ArrowDown' }) as KeyboardEvent, 'down')
      ).toBe(true);
      expect(
        keyMatch(createKeyboardEvent({ key: 'ArrowLeft' }) as KeyboardEvent, 'left')
      ).toBe(true);
      expect(
        keyMatch(createKeyboardEvent({ key: 'ArrowRight' }) as KeyboardEvent, 'right')
      ).toBe(true);
    });
  });

  describe('modifier key combinations', () => {
    test('should match Ctrl combinations', () => {
      const event = createKeyboardEvent({ key: 'n', ctrlKey: true });
      expect(keyMatch(event as KeyboardEvent, 'ctrl+n')).toBe(true);
      expect(keyMatch(event as KeyboardEvent, 'control+n')).toBe(true);
      expect(keyMatch(event as KeyboardEvent, 'n')).toBe(false); // without ctrl
    });

    test('should match Alt combinations', () => {
      const event = createKeyboardEvent({ key: 'f4', altKey: true });
      expect(keyMatch(event as KeyboardEvent, 'alt+f4')).toBe(true);
      expect(keyMatch(event as KeyboardEvent, 'f4')).toBe(false); // without alt
    });

    test('should match Shift combinations', () => {
      const event = createKeyboardEvent({ key: 'Tab', shiftKey: true });
      expect(keyMatch(event as KeyboardEvent, 'shift+tab')).toBe(true);
      expect(keyMatch(event as KeyboardEvent, 'tab')).toBe(false); // without shift
    });

    test('should match Meta/Cmd combinations', () => {
      const event = createKeyboardEvent({ key: 's', metaKey: true });
      expect(keyMatch(event as KeyboardEvent, 'meta+s')).toBe(true);
      expect(keyMatch(event as KeyboardEvent, 'cmd+s')).toBe(true);
      expect(keyMatch(event as KeyboardEvent, 'command+s')).toBe(true);
      expect(keyMatch(event as KeyboardEvent, 's')).toBe(false); // without meta
    });

    test('should match multiple modifiers', () => {
      const event = createKeyboardEvent({ 
        key: 'z', 
        ctrlKey: true, 
        shiftKey: true 
      });
      expect(keyMatch(event as KeyboardEvent, 'ctrl+shift+z')).toBe(true);
      expect(keyMatch(event as KeyboardEvent, 'shift+ctrl+z')).toBe(true); // order shouldn't matter
      expect(keyMatch(event as KeyboardEvent, 'ctrl+z')).toBe(false); // missing shift
    });
  });

  describe('CmdOrCtrl modifier', () => {
    test('should match Ctrl on Windows', () => {
      // Mock Windows platform
      (global as any).navigator.platform = 'Win32';
      
      const event = createKeyboardEvent({ key: 'n', ctrlKey: true });
      expect(keyMatch(event as KeyboardEvent, 'cmdorctrl+n')).toBe(true);
      expect(keyMatch(event as KeyboardEvent, 'commandorcontrol+n')).toBe(true);
      
      const metaEvent = createKeyboardEvent({ key: 'n', metaKey: true });
      expect(keyMatch(metaEvent as KeyboardEvent, 'cmdorctrl+n')).toBe(false);
    });

    test('should match Cmd on macOS', () => {
      // Mock macOS platform
      (global as any).navigator.platform = 'MacIntel';
      
      const event = createKeyboardEvent({ key: 'n', metaKey: true });
      expect(keyMatch(event as KeyboardEvent, 'cmdorctrl+n')).toBe(true);
      expect(keyMatch(event as KeyboardEvent, 'commandorcontrol+n')).toBe(true);
      
      const ctrlEvent = createKeyboardEvent({ key: 'n', ctrlKey: true });
      expect(keyMatch(ctrlEvent as KeyboardEvent, 'cmdorctrl+n')).toBe(false);
    });
  });

  describe('multiple key alternatives (Or syntax)', () => {
    test('should match first alternative', () => {
      const enterEvent = createKeyboardEvent({ key: 'Enter' });
      expect(keyMatch(enterEvent as KeyboardEvent, 'EnterOrSpace')).toBe(true);
    });

    test('should match second alternative', () => {
      const spaceEvent = createKeyboardEvent({ key: ' ' });
      expect(keyMatch(spaceEvent as KeyboardEvent, 'EnterOrSpace')).toBe(true);
    });

    test('should not match unrelated keys', () => {
      const escapeEvent = createKeyboardEvent({ key: 'Escape' });
      expect(keyMatch(escapeEvent as KeyboardEvent, 'EnterOrSpace')).toBe(false);
    });

    test('should work with modifiers and multiple keys', () => {
      const ctrlEnterEvent = createKeyboardEvent({ key: 'Enter', ctrlKey: true });
      const ctrlSpaceEvent = createKeyboardEvent({ key: ' ', ctrlKey: true });
      const plainEnterEvent = createKeyboardEvent({ key: 'Enter' });

      expect(keyMatch(ctrlEnterEvent as KeyboardEvent, 'Ctrl+EnterOrSpace')).toBe(true);
      expect(keyMatch(ctrlSpaceEvent as KeyboardEvent, 'Ctrl+EnterOrSpace')).toBe(true);
      expect(keyMatch(plainEnterEvent as KeyboardEvent, 'Ctrl+EnterOrSpace')).toBe(false);
    });

    test('should handle three or more alternatives', () => {
      const enterEvent = createKeyboardEvent({ key: 'Enter' });
      const spaceEvent = createKeyboardEvent({ key: ' ' });
      const tabEvent = createKeyboardEvent({ key: 'Tab' });
      const escapeEvent = createKeyboardEvent({ key: 'Escape' });

      const pattern = 'EnterOrSpaceOrTab';
      expect(keyMatch(enterEvent as KeyboardEvent, pattern)).toBe(true);
      expect(keyMatch(spaceEvent as KeyboardEvent, pattern)).toBe(true);
      expect(keyMatch(tabEvent as KeyboardEvent, pattern)).toBe(true);
      expect(keyMatch(escapeEvent as KeyboardEvent, pattern)).toBe(false);
    });
  });

  describe('protected modifiers with Or', () => {
    test('CmdOrCtrl should not be split by Or parsing', () => {
      (global as any).navigator.platform = 'Win32';
      
      const event = createKeyboardEvent({ key: 'n', ctrlKey: true });
      expect(keyMatch(event as KeyboardEvent, 'CmdOrCtrl+n')).toBe(true);
      
      const metaEvent = createKeyboardEvent({ key: 'n', metaKey: true });
      expect(keyMatch(metaEvent as KeyboardEvent, 'CmdOrCtrl+n')).toBe(false);
    });

    test('CommandOrControl should not be split by Or parsing', () => {
      (global as any).navigator.platform = 'Win32';
      
      const event = createKeyboardEvent({ key: 's', ctrlKey: true });
      expect(keyMatch(event as KeyboardEvent, 'CommandOrControl+s')).toBe(true);
      
      const metaEvent = createKeyboardEvent({ key: 's', metaKey: true });
      expect(keyMatch(metaEvent as KeyboardEvent, 'CommandOrControl+s')).toBe(false);
    });

    test('should work with CmdOrCtrl and key alternatives', () => {
      (global as any).navigator.platform = 'Win32';
      
      const ctrlEnterEvent = createKeyboardEvent({ key: 'Enter', ctrlKey: true });
      const ctrlSpaceEvent = createKeyboardEvent({ key: ' ', ctrlKey: true });
      
      expect(keyMatch(ctrlEnterEvent as KeyboardEvent, 'CmdOrCtrl+EnterOrSpace')).toBe(true);
      expect(keyMatch(ctrlSpaceEvent as KeyboardEvent, 'CmdOrCtrl+EnterOrSpace')).toBe(true);
    });
  });

  describe('edge cases', () => {
    test('should handle empty string', () => {
      const event = createKeyboardEvent({ key: 'a' });
      expect(keyMatch(event as KeyboardEvent, '')).toBe(false);
    });

    test('should handle whitespace-only string', () => {
      const event = createKeyboardEvent({ key: 'a' });
      expect(keyMatch(event as KeyboardEvent, '   ')).toBe(false);
    });

    test('should throw on invalid accelerator', () => {
      const event = createKeyboardEvent({ key: 'a' });
      expect(() => keyMatch(event as KeyboardEvent, 'ctrl+')).toThrow();
      expect(() => keyMatch(event as KeyboardEvent, '+')).toThrow();
    });

    test('should be case insensitive', () => {
      const event = createKeyboardEvent({ key: 'A', ctrlKey: true });
      expect(keyMatch(event as KeyboardEvent, 'CTRL+A')).toBe(true);
      expect(keyMatch(event as KeyboardEvent, 'ctrl+a')).toBe(true);
      expect(keyMatch(event as KeyboardEvent, 'Ctrl+A')).toBe(true);
    });
  });

  describe('modifier aliases', () => {
    test('should support option as alt on macOS', () => {
      (global as any).navigator.platform = 'MacIntel';
      
      const event = createKeyboardEvent({ key: 'f', altKey: true });
      expect(keyMatch(event as KeyboardEvent, 'option+f')).toBe(true);
      expect(keyMatch(event as KeyboardEvent, 'alt+f')).toBe(true);
    });

    test('should ignore option on non-macOS', () => {
      (global as any).navigator.platform = 'Win32';
      
      const event = createKeyboardEvent({ key: 'f', altKey: true });
      expect(keyMatch(event as KeyboardEvent, 'option+f')).toBe(false);
      expect(keyMatch(event as KeyboardEvent, 'alt+f')).toBe(true);
    });

    test('should support super as meta', () => {
      const event = createKeyboardEvent({ key: 'r', metaKey: true });
      expect(keyMatch(event as KeyboardEvent, 'super+r')).toBe(true);
      expect(keyMatch(event as KeyboardEvent, 'meta+r')).toBe(true);
    });
  });
});

describe('browser environment handling', () => {
  test('should handle missing navigator', () => {
    const originalNavigator = (global as any).navigator;
    delete (global as any).navigator;
    
    try {
      const event = createKeyboardEvent({ key: 'n', ctrlKey: true });
      // Should default to non-macOS behavior when navigator is undefined
      expect(keyMatch(event as KeyboardEvent, 'cmdorctrl+n')).toBe(true);
    } finally {
      (global as any).navigator = originalNavigator;
    }
  });

  test('should handle missing userAgentData', () => {
    const originalNavigator = (global as any).navigator;
    (global as any).navigator = { platform: 'MacIntel' };
    
    try {
      const event = createKeyboardEvent({ key: 'n', metaKey: true });
      expect(keyMatch(event as KeyboardEvent, 'cmdorctrl+n')).toBe(true);
    } finally {
      (global as any).navigator = originalNavigator;
    }
  });
}); 