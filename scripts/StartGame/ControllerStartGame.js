import { ViewStartGame } from './ViewStartGame.js';
import { ModelStartGame } from './ModelStartGame.js';

export class ControllerStartGame {
	constructor(publisher) {
		this.model = new ModelStartGame();
		this.view = new ViewStartGame(this.newGame.bind(this), this.loadGame.bind(this));
		this.publisher = publisher;
	}

	newGame() {
		this.publisher.publish('startNewGame');
		this.view.closeModalWnd();
	}

	loadGame() {
		this.publisher.publish('startLoadGame');
		this.view.closeModalWnd();
	}
}
