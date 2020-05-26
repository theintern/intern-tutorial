import React, { useState, useEffect } from 'react';
import Buttons from './Buttons';
import { Button, ButtonHandler, Operation } from './common';
import Display from './Display';
import { BUTTON_HANDLERS } from './logic';
import './Calculator.css';

export default function Calculator() {
  const [value, setValue] = useState<string>('0');
  const [total, setTotal] = useState<number | undefined | null>();
  const [operation, setOperation] = useState<Operation | null | undefined>();
  const buttonArgs = { value, setValue, total, setTotal, operation, setOperation };
  const buttonHandlers: { [key: string]: ButtonHandler } = {
    Delete: BUTTON_HANDLERS.ac,
    Backspace: BUTTON_HANDLERS.ac,
    '/': BUTTON_HANDLERS.divide,
    '*': BUTTON_HANDLERS.times,
    '+': BUTTON_HANDLERS.plus,
    '-': BUTTON_HANDLERS.minus,
    '.': BUTTON_HANDLERS.dot,
    '#': BUTTON_HANDLERS.sign,
    '%': BUTTON_HANDLERS.percent,
    Enter: BUTTON_HANDLERS.equals,
    '=': BUTTON_HANDLERS.equals,
    '0': BUTTON_HANDLERS.zero,
    '1': BUTTON_HANDLERS.one,
    '2': BUTTON_HANDLERS.two,
    '3': BUTTON_HANDLERS.three,
    '4': BUTTON_HANDLERS.four,
    '5': BUTTON_HANDLERS.five,
    '6': BUTTON_HANDLERS.six,
    '7': BUTTON_HANDLERS.seven,
    '8': BUTTON_HANDLERS.eight,
    '9': BUTTON_HANDLERS.nine,
  };

  function onButtonPush(btn: Button) {
    BUTTON_HANDLERS[btn](buttonArgs);
  }

  function onKey({ key }: KeyboardEvent) {
    if (buttonHandlers[key]) {
      buttonHandlers[key](buttonArgs);
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
    };
  });

  return (
    <div className="Calculator">
      <div className="Calculator-controls">
        <Display value={value} />
        <Buttons onButton={onButtonPush} operation={operation} />
      </div>
    </div>
  );
}
