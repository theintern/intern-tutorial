import { greet } from './hello';

const greeting = document.getElementById('greeting');
const loginForm = document.getElementById('loginForm');
const nameField = document.getElementById('nameField') as HTMLInputElement;

loginForm!.addEventListener('submit', (event: Event) => {
	event.preventDefault();

	greeting!.innerHTML = greet(nameField.value).replace(/&/g, '&amp;').replace(/</g, '&lt;');
});

document.body.className += ' loaded';
