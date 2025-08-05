type Alphabet = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' 
  | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z';

type CommonKey = 
  | Alphabet
  | Uppercase<Alphabet>
  | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
  | 'Enter' | 'Escape' | 'Space' | 'Tab' | 'Backspace' | 'Delete'
  | 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight'
  | 'Up' | 'Down' | 'Left' | 'Right'
  | 'Home' | 'End' | 'PageUp' | 'PageDown'
  | 'F1' | 'F2' | 'F3' | 'F4' | 'F5' | 'F6' | 'F7' | 'F8' | 'F9' | 'F10' | 'F11' | 'F12'
  | 'Plus' | 'Minus' | 'Equal' | 'Slash' | 'Backslash';

type Modifier = 
  | 'Ctrl' | 'Control' | 'Alt' | 'Shift' | 'Meta' | 'Cmd' | 'Command' | 'Super'
  | 'CmdOrCtrl' | 'CommandOrControl' | 'Option';

type CommonPattern = 
  | CommonKey
  | `${Modifier}+${CommonKey}`
  | `${Modifier}+${Modifier}+${CommonKey}`
  | 'EnterOrSpace' | 'EscapeOrCtrl+c' | 'EnterOrSpaceOrTab';

declare const __brand: unique symbol;
type KeyboardPatternString = string & { [__brand]: 'KeyboardPattern' };

export type KeyboardPattern = CommonPattern | KeyboardPatternString;

export const keyPattern = <T extends string>(pattern: T): KeyboardPatternString => 
  pattern as unknown as KeyboardPatternString;

export type KeyMatchCallbacks = Record<CommonPattern | string, (event?: KeyboardEvent) => void>;

export type KeyMatchCallbacksFlexible = Record<string, (event?: KeyboardEvent) => void>;
