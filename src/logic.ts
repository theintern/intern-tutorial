import { BUTTONS, Button, ButtonHandler, Operation } from './common';

export const BUTTON_HANDLERS: { [key: string]: ButtonHandler } = {
  ac: ({ setOperation, setValue }) => {
    setValue('0');
    setOperation(null);
  },

  dot: ({ setValue, value }) => {
    if (value.indexOf('.') === -1) {
      setValue(value + '.');
    }
  },

  divide: createOperationHandler('/'),

  eight: createNumberHandler('eight'),

  equals: ({
    operation,
    setOperation,
    setTotal,
    setValue,
    total,
    value,
  }) => {
    if (operation) {
      let newVal: number;
      const numberVal = parseFloat(value);
      const tot = total as number;

      switch (operation) {
        case '+':
          newVal = tot + numberVal;
          break;
        case '-':
          newVal = tot - numberVal;
          break;
        case '*':
          newVal = tot * numberVal;
          break;
        default:
          newVal = tot / numberVal;
          break;
      }

      setTotal(newVal);
      setValue(newVal.toString());
      setOperation(null);
    }
  },

  five: createNumberHandler('five'),

  four: createNumberHandler('four'),

  minus: createOperationHandler('-'),

  nine: createNumberHandler('nine'),

  one: createNumberHandler('one'),

  percent: ({ setValue, value }) => {
    const numberVal = parseFloat(value);
    setValue((numberVal / 100).toString());
  },

  plus: createOperationHandler('+'),

  seven: createNumberHandler('seven'),

  sign: ({ setValue, value }) => {
    const numberVal = parseFloat(value);
    setValue((-numberVal).toString());
  },

  six: createNumberHandler('six'),

  three: createNumberHandler('three'),

  times: createOperationHandler('*'),

  two: createNumberHandler('two'),

  zero: createNumberHandler('zero'),
};


function createNumberHandler(button: Button): ButtonHandler {
  return ({ setValue, value }) => {
    const btnValue = BUTTONS[button].value;
    if (value === '0') {
      setValue(btnValue);
    } else {
      setValue(value + btnValue);
    }
  };
}

function createOperationHandler(operation: Operation): ButtonHandler {
  return ({ setOperation, setTotal, setValue, value }) => {
    setTotal(parseFloat(value));
    setOperation(operation);
    setValue('0');
  };
}
