import React from 'react';
import './Display.css';

export interface DisplayProps {
  value: string;
}

export default function Display(props: DisplayProps) {
  return (
    <div className="Display" title={props.value}>
      {props.value}
    </div>
  );
}
