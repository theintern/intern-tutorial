import { ButtonHandlerArgs, Operation } from '../../src/common';
import { BUTTON_HANDLERS } from '../../src/logic';

const { suite, test } = intern.getPlugin('interface.tdd');
const { assert } = intern.getPlugin('chai');

suite('logic', () => {
	test('ac', () => {
		const buttonArgs: ButtonHandlerArgs = {
			operation: null,
			setOperation(newOp: Operation) {
				buttonArgs.operation = newOp;
			},

			value: '1.2',
			setValue(newValue: string) {
				buttonArgs.value = newValue;
			},

			total: null,
			setTotal(newTotal: number) {
				buttonArgs.total = newTotal;
			}
		};

		BUTTON_HANDLERS.ac(buttonArgs);
		assert.strictEqual(buttonArgs.value, '0');
	});
});
