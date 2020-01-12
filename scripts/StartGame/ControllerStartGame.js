import { ViewStartGame } from './ViewStartGame.js';
import { ModelStartGame } from './ModelStartGame.js';
import * as allClassesFigures from '../ChessFigure/figure.js';

export class ControllerStartGame {
	constructor() {
		this.model = new ModelStartGame();
		this.view = new ViewStartGame();
		this.allClassesFigures = allClassesFigures;
		this.view.creatModalWnd(this.newGame.bind(this), this.loadGame.bind(this));
	}

	newGame() {
		this.view.newGame(this.allClassesFigures);
		this.view.closeModalWnd();
	}

	loadGame() {
		const saveGame = this.model.loadGameFromLS();
		this.view.loadGame(this.allClassesFigures, saveGame);
		this.view.closeModalWnd();
	}

	closeModalWnd() {
		this.view.creatModalWnd();
	}
}
