/*
 * A very simple module with no dependencies
 */

export function greet(name?: string) {
	name = name || 'world';
	return `Hello, ${name}!`;
}
