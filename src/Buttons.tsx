import React from 'react';
import { BUTTONS, Button, Operation } from './common';
import './Buttons.css';

export interface ButtonsProps {
  onButton(btn: Button): void;
  operation?: Operation | null;
}

export default function Buttons(props: ButtonsProps) {
  const onPush = (btn: Button) => (_event: React.MouseEvent) =>
    props.onButton(btn);

  const buttons: Button[] = [
    'ac',
    'sign',
    'percent',
    'divide',
    'seven',
    'eight',
    'nine',
    'times',
    'four',
    'five',
    'six',
    'minus',
    'one',
    'two',
    'three',
    'plus',
    'zero',
    'dot',
    'equals',
  ];

  return (
    <div className="Buttons">
      {buttons.map((btn, index) => {
        const classes = [`Buttons-${btn}`];
        if (props.operation && props.operation === BUTTONS[btn].operation) {
          classes.push('Buttons-activeOp');
        }

        return (
          <button
            onClick={onPush(btn)}
            className={classes.join(' ')}
            key={index}
          >
            {BUTTONS[btn].value}
          </button>
        );
      })}
    </div>
  );
}
