import { ButtonHandlerArgs, Operation } from '../../src/common';
import { BUTTON_HANDLERS } from '../../src/logic';

const { suite, test, beforeEach } = intern.getPlugin('interface.tdd');
const { assert } = intern.getPlugin('chai');

suite('logic', () => {
	let buttonArgs: ButtonHandlerArgs;

	beforeEach(() => {
		buttonArgs = {
			operation: null,
			setOperation(newOp: Operation) {
				buttonArgs.operation = newOp;
			},

			value: '0',
			setValue(newValue: string) {
				buttonArgs.value = newValue;
			},

			total: null,
			setTotal(newTotal: number) {
				buttonArgs.total = newTotal;
			}
		};
	});

	test('ac', () => {
		buttonArgs.value = '1.2';
		BUTTON_HANDLERS.ac(buttonArgs);
		assert.strictEqual(buttonArgs.value, '0');
	});

	suite('dot', () => {
		test('add decimal dot to whole number', () => {
			buttonArgs.value = '1';
			BUTTON_HANDLERS.dot(buttonArgs);
			assert.strictEqual(buttonArgs.value, '1.');
		});

		test('add decimal to number with trailing decimal', () => {
			buttonArgs.value = '1.';
			BUTTON_HANDLERS.dot(buttonArgs);
			assert.strictEqual(buttonArgs.value, '1.');
		});

		test('add decimal to floating point number', () => {
			buttonArgs.value = '1.2';
			BUTTON_HANDLERS.dot(buttonArgs);
			assert.strictEqual(buttonArgs.value, '1.2');
		});
	});

});
