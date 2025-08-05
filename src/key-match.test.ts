import { test, describe } from 'node:test';
import assert from 'node:assert';
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

// Testing wrapper to avoid repetitive casting and follow DRY principle
function testKeyMatch(
  eventProps: {
    key: string;
    ctrlKey?: boolean;
    altKey?: boolean;
    shiftKey?: boolean;
    metaKey?: boolean;
  },
  pattern: string
): boolean {
  const event = createKeyboardEvent(eventProps);
  return keyMatch(event as KeyboardEvent, pattern);
}

// Helper for testing multiple patterns against the same event
function testKeyMatchMultiple(
  eventProps: {
    key: string;
    ctrlKey?: boolean;
    altKey?: boolean;
    shiftKey?: boolean;
    metaKey?: boolean;
  },
  patterns: { pattern: string; expected: boolean }[]
): void {
  patterns.forEach(({ pattern, expected }) => {
    assert.strictEqual(testKeyMatch(eventProps, pattern), expected, `Pattern "${pattern}" should ${expected ? 'match' : 'not match'}`);
  });
}

// Mock navigator for platform detection
(global as any).navigator = {
  platform: 'Win32' // Default to Windows for testing
};

describe('keyMatch', () => {
  describe('single key matching', () => {
    test('should match simple letter keys', () => {
      testKeyMatchMultiple({ key: 'a' }, [
        { pattern: 'a', expected: true },
        { pattern: 'A', expected: true }, // case insensitive
        { pattern: 'b', expected: false }
      ]);
    });

    test('should match special keys', () => {
      assert.strictEqual(testKeyMatch({ key: 'Enter' }, 'enter'), true);
      assert.strictEqual(testKeyMatch({ key: 'Escape' }, 'escape'), true);
    });

    test('should normalize space key', () => {
      assert.strictEqual(testKeyMatch({ key: ' ' }, 'space'), true);
    });

    test('should normalize arrow keys', () => {
      testKeyMatchMultiple({ key: 'ArrowUp' }, [{ pattern: 'up', expected: true }]);
      testKeyMatchMultiple({ key: 'ArrowDown' }, [{ pattern: 'down', expected: true }]);
      testKeyMatchMultiple({ key: 'ArrowLeft' }, [{ pattern: 'left', expected: true }]);
      testKeyMatchMultiple({ key: 'ArrowRight' }, [{ pattern: 'right', expected: true }]);
    });
  });

  describe('modifier key combinations', () => {
    test('should match Ctrl combinations', () => {
      testKeyMatchMultiple({ key: 'n', ctrlKey: true }, [
        { pattern: 'ctrl+n', expected: true },
        { pattern: 'control+n', expected: true },
        { pattern: 'n', expected: false } // without ctrl
      ]);
    });

    test('should match Alt combinations', () => {
      testKeyMatchMultiple({ key: 'f4', altKey: true }, [
        { pattern: 'alt+f4', expected: true },
        { pattern: 'f4', expected: false } // without alt
      ]);
    });

    test('should match Shift combinations', () => {
      testKeyMatchMultiple({ key: 'Tab', shiftKey: true }, [
        { pattern: 'shift+tab', expected: true },
        { pattern: 'tab', expected: false } // without shift
      ]);
    });

    test('should match Meta/Cmd combinations', () => {
      testKeyMatchMultiple({ key: 's', metaKey: true }, [
        { pattern: 'meta+s', expected: true },
        { pattern: 'cmd+s', expected: true },
        { pattern: 'command+s', expected: true },
        { pattern: 's', expected: false } // without meta
      ]);
    });

    test('should match multiple modifiers', () => {
      testKeyMatchMultiple({ key: 'z', ctrlKey: true, shiftKey: true }, [
        { pattern: 'ctrl+shift+z', expected: true },
        { pattern: 'shift+ctrl+z', expected: true }, // order shouldn't matter
        { pattern: 'ctrl+z', expected: false } // missing shift
      ]);
    });
  });

  describe('CmdOrCtrl modifier', () => {
    test('should match Ctrl on Windows', () => {
      // Mock Windows platform
      (global as any).navigator.platform = 'Win32';
      
      testKeyMatchMultiple({ key: 'n', ctrlKey: true }, [
        { pattern: 'cmdorctrl+n', expected: true },
        { pattern: 'commandorcontrol+n', expected: true }
      ]);
      
      assert.strictEqual(testKeyMatch({ key: 'n', metaKey: true }, 'cmdorctrl+n'), false);
    });

    test('should match Cmd on macOS', () => {
      // Mock macOS platform
      (global as any).navigator.platform = 'MacIntel';
      
      testKeyMatchMultiple({ key: 'n', metaKey: true }, [
        { pattern: 'cmdorctrl+n', expected: true },
        { pattern: 'commandorcontrol+n', expected: true }
      ]);
      
      assert.strictEqual(testKeyMatch({ key: 'n', ctrlKey: true }, 'cmdorctrl+n'), false);
    });
  });

  describe('multiple key alternatives (Or syntax)', () => {
    test('should match first alternative', () => {
      assert.strictEqual(testKeyMatch({ key: 'Enter' }, 'EnterOrSpace'), true);
    });

    test('should match second alternative', () => {
      assert.strictEqual(testKeyMatch({ key: ' ' }, 'EnterOrSpace'), true);
    });

    test('should not match unrelated keys', () => {
      assert.strictEqual(testKeyMatch({ key: 'Escape' }, 'EnterOrSpace'), false);
    });

    test('should work with modifiers and multiple keys', () => {
      testKeyMatchMultiple({ key: 'Enter', ctrlKey: true }, [
        { pattern: 'Ctrl+EnterOrSpace', expected: true }
      ]);
      testKeyMatchMultiple({ key: ' ', ctrlKey: true }, [
        { pattern: 'Ctrl+EnterOrSpace', expected: true }
      ]);
      assert.strictEqual(testKeyMatch({ key: 'Enter' }, 'Ctrl+EnterOrSpace'), false);
    });

    test('should handle three or more alternatives', () => {
      const pattern = 'EnterOrSpaceOrTab';
      testKeyMatchMultiple({ key: 'Enter' }, [{ pattern, expected: true }]);
      testKeyMatchMultiple({ key: ' ' }, [{ pattern, expected: true }]);
      testKeyMatchMultiple({ key: 'Tab' }, [{ pattern, expected: true }]);
      testKeyMatchMultiple({ key: 'Escape' }, [{ pattern, expected: false }]);
    });
  });

  describe('protected modifiers with Or', () => {
    test('CmdOrCtrl should not be split by Or parsing', () => {
      (global as any).navigator.platform = 'Win32';
      
      assert.strictEqual(testKeyMatch({ key: 'n', ctrlKey: true }, 'CmdOrCtrl+n'), true);
      assert.strictEqual(testKeyMatch({ key: 'n', metaKey: true }, 'CmdOrCtrl+n'), false);
    });

    test('CommandOrControl should not be split by Or parsing', () => {
      (global as any).navigator.platform = 'Win32';
      
      assert.strictEqual(testKeyMatch({ key: 's', ctrlKey: true }, 'CommandOrControl+s'), true);
      assert.strictEqual(testKeyMatch({ key: 's', metaKey: true }, 'CommandOrControl+s'), false);
    });

    test('should work with CmdOrCtrl and key alternatives', () => {
      (global as any).navigator.platform = 'Win32';
      
      testKeyMatchMultiple({ key: 'Enter', ctrlKey: true }, [
        { pattern: 'CmdOrCtrl+EnterOrSpace', expected: true }
      ]);
      testKeyMatchMultiple({ key: ' ', ctrlKey: true }, [
        { pattern: 'CmdOrCtrl+EnterOrSpace', expected: true }
      ]);
    });
  });

  describe('edge cases', () => {
    test('should handle empty string', () => {
      assert.strictEqual(testKeyMatch({ key: 'a' }, ''), false);
    });

    test('should handle whitespace-only string', () => {
      assert.strictEqual(testKeyMatch({ key: 'a' }, '   '), false);
    });

    test('should throw on invalid accelerator', () => {
      assert.throws(() => testKeyMatch({ key: 'a' }, 'ctrl+'));
      assert.throws(() => testKeyMatch({ key: 'a' }, '+'));
    });

    test('should be case insensitive', () => {
      testKeyMatchMultiple({ key: 'A', ctrlKey: true }, [
        { pattern: 'CTRL+A', expected: true },
        { pattern: 'ctrl+a', expected: true },
        { pattern: 'Ctrl+A', expected: true }
      ]);
    });
  });

  describe('modifier aliases', () => {
    test('should support option as alt on macOS', () => {
      (global as any).navigator.platform = 'MacIntel';
      
      testKeyMatchMultiple({ key: 'f', altKey: true }, [
        { pattern: 'option+f', expected: true },
        { pattern: 'alt+f', expected: true }
      ]);
    });

    test('should ignore option on non-macOS', () => {
      (global as any).navigator.platform = 'Win32';
      
      testKeyMatchMultiple({ key: 'f', altKey: true }, [
        { pattern: 'option+f', expected: false },
        { pattern: 'alt+f', expected: true }
      ]);
    });

    test('should support super as meta', () => {
      testKeyMatchMultiple({ key: 'r', metaKey: true }, [
        { pattern: 'super+r', expected: true },
        { pattern: 'meta+r', expected: true }
      ]);
    });
  });
});

describe('browser environment handling', () => {
  test('should handle missing navigator', () => {
    const originalNavigator = (global as any).navigator;
    delete (global as any).navigator;
    
    try {
      // Should default to non-macOS behavior when navigator is undefined
      assert.strictEqual(testKeyMatch({ key: 'n', ctrlKey: true }, 'cmdorctrl+n'), true);
    } finally {
      (global as any).navigator = originalNavigator;
    }
  });

  test('should handle missing userAgentData', () => {
    const originalNavigator = (global as any).navigator;
    (global as any).navigator = { platform: 'MacIntel' };
    
    try {
      assert.strictEqual(testKeyMatch({ key: 'n', metaKey: true }, 'cmdorctrl+n'), true);
    } finally {
      (global as any).navigator = originalNavigator;
    }
  });
}); 