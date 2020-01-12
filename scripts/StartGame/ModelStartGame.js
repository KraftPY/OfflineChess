export class ModelStartGame {
	constructor() {}

	loadGameFromLS() {
		return JSON.parse(localStorage.getItem('history'));
	}
}
