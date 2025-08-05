/**
 * Dynamically checks if we're on macOS
 */
function getIsMacOS(): boolean {
    if (typeof navigator === 'undefined') {
        return false;
    }

    const platform = (() => {
        if ('userAgentData' in navigator) {
            return (navigator.userAgentData as { platform: string }).platform ?? '';
        }

        return navigator.platform;
    })();

    return platform.toUpperCase().indexOf('MAC') >= 0;
}

/**
 * Parses modifiers from an array of modifier strings
 */
function parseModifiers(modifierParts: string[]) {
  let ctrl = false, alt = false, shift = false, meta = false;

  for (const modifier of modifierParts) {
    switch (modifier) {
      case 'cmd':
      case 'command':
        meta = true;
        break;
      case 'ctrl':
      case 'control':
        ctrl = true;
        break;
      case 'cmdorctrl':
      case 'commandorcontrol':
        if (getIsMacOS()) {
          meta = true;
        } else {
          ctrl = true;
        }
        break;
      case 'alt':
        alt = true;
        break;
      case 'option':
        if (getIsMacOS()) {
          alt = true;
        }
        break;
      case 'shift':
        shift = true;
        break;
      case 'meta':
      case 'super':
        meta = true;
        break;
    }
  }

  return { ctrl, alt, shift, meta };
}

/**
 * Handles parsing of a single key combination (no "Or" separator)
 */
function parseSingleKeyMatch(matchString: string) {
  const parts = matchString.split('+');
  const key = parts[parts.length - 1]?.toLowerCase();
  if (!key) {
    throw new Error(`Invalid accelerator: ${matchString}`);
  }

  const modifierParts = parts.slice(0, -1).map(part => part.toLowerCase());
  const modifiers = parseModifiers(modifierParts);

  return { ...modifiers, keys: [key] };
}

/**
 * Handles parsing of multiple key combinations separated by "Or"
 */
function parseMultipleKeyMatch(keyAlternatives: string[]) {
  const keys: string[] = [];
  let modifiers = { ctrl: false, alt: false, shift: false, meta: false };
  let firstCombination = true;

  for (const alternative of keyAlternatives) {
    const parts = alternative.trim().split('+');
    const key = parts[parts.length - 1]?.toLowerCase();
    if (!key) {
      throw new Error(`Invalid accelerator: ${alternative.trim()}`);
    }
    keys.push(key);

    // Use modifiers from the first combination (assuming all alternatives have same modifiers)
    if (firstCombination) {
      const modifierParts = parts.slice(0, -1).map(part => part.toLowerCase());
      modifiers = parseModifiers(modifierParts);
      firstCombination = false;
    }
  }

  return { ...modifiers, keys };
}

/**
 * Parses a browser accelerator string into its components
 */
function parseMatchString(matchString: string) {
  if (!matchString?.trim()) {
    return { ctrl: false, alt: false, shift: false, meta: false, keys: [''] };
  }

  // Protect modifiers that contain "or" from being split by using placeholders
  let processedString = matchString
    .replace(/cmdorctrl/gi, '__CMDCTRL__')
    .replace(/commandorcontrol/gi, '__COMMANDCONTROL__');

  // Split by "Or" to handle multiple key combinations like "EnterOrSpace"
  const keyAlternatives = processedString.split(/or/i);
  
  // Restore the protected modifiers
  const restoredAlternatives = keyAlternatives.map(alt => 
    alt.replace(/__CMDCTRL__/g, 'cmdorctrl')
       .replace(/__COMMANDCONTROL__/g, 'commandorcontrol')
  );
  
  if (restoredAlternatives.length === 1) {
    // Use the processed and restored string for single key combinations too
    return parseSingleKeyMatch(restoredAlternatives[0]);
  } else {
    return parseMultipleKeyMatch(restoredAlternatives);
  }
}

/**
 * Normalizes a key from a KeyboardEvent to match Electron's key naming
 */
function normalizeKey(key: string): string {
  const keyMap: Record<string, string> = {
    ' ': 'space',
    'arrowup': 'up',
    'arrowdown': 'down',
    'arrowleft': 'left',
    'arrowright': 'right',

  };

  const normalized = key.toLowerCase();
  return keyMap[normalized] || normalized;
}

/**
 * Checks if a KeyboardEvent matches a browser accelerator string
 * 
 * @example
 * ```typescript
 * if (keyMatch(event, 'CmdOrCtrl+N')) {
 *   event.preventDefault();
 *   createNewFile();
 * }
 * 
 * // Multiple keys example
 * if (keyMatch(event, 'EnterOrSpace')) {
 *   event.preventDefault();
 *   submit();
 * }
 * ```
 */
export function keyMatch(event: KeyboardEvent, matchString: string): boolean {
  const { ctrl, alt, shift, meta, keys } = parseMatchString(matchString);

  return keys.some(key => normalizeKey(event.key) === key) &&
    event.ctrlKey === ctrl &&
    event.altKey === alt &&
    event.shiftKey === shift &&
    event.metaKey === meta;
}
