export type Button =
  | 'zero'
  | 'one'
  | 'two'
  | 'three'
  | 'four'
  | 'five'
  | 'six'
  | 'seven'
  | 'eight'
  | 'nine'
  | 'dot'
  | 'plus'
  | 'minus'
  | 'times'
  | 'divide'
  | 'sign'
  | 'percent'
  | 'ac'
  | 'equals';

export const BUTTONS: {
  [K in Button]: {
    value: string;
    operation?: Operation;
  };
} = {
  zero: { value: '0' },
  one: { value: '1' },
  two: { value: '2' },
  three: { value: '3' },
  four: { value: '4' },
  five: { value: '5' },
  six: { value: '6' },
  seven: { value: '7' },
  eight: { value: '8' },
  nine: { value: '9' },
  dot: { value: '.' },
  plus: { value: '+', operation: '+' },
  minus: { value: '-', operation: '-' },
  times: { value: '×', operation: '*' },
  divide: { value: '÷', operation: '/' },
  sign: { value: '±' },
  percent: { value: '%' },
  ac: { value: 'AC' },
  equals: { value: '=' },
};

export interface ButtonHandlerArgs {
  value: string;
  setValue(value: string): void;
  total: number | null | undefined;
  setTotal(value: number): void;
  operation: Operation | null | undefined;
  setOperation(value: Operation | null): void;
}

export interface ButtonHandler {
  (args: ButtonHandlerArgs): void;
}

export type Operation = '+' | '-' | '/' | '*';
