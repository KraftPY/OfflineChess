import { ViewStartGame } from './ViewStartGame.js';
import { ModelStartGame } from './ModelStartGame.js';
import * as allClassesFigures from '../ChessFigure/figure.js';
import { arrFigures, keepMoveInStory } from '../main.js';

export class ControllerStartGame {
	constructor() {
		this.model = new ModelStartGame();
		this.view = new ViewStartGame();
		this.arrFigures = arrFigures;
		this.keepMoveInStory = keepMoveInStory;
		this.allClassesFigures = allClassesFigures;
		this.view.creatModalWnd(this.newGame.bind(this), this.loadGame.bind(this));
	}

	newGame() {
		this.view.newGame(this.allClassesFigures);
		this.view.closeModalWnd();
	}

	loadGame() {
		const saveGame = this.model.loadGameFromLS();
		const isSaveGame = this.view.loadGame(this.allClassesFigures, saveGame);
		if (isSaveGame) {
			this.view.closeModalWnd();
			const {
				firstFigure,
				previousPos,
				secondFigure,
				swap
			} = this.model.getLastMoveFromSaveGame(this.arrFigures);

			// Todo: Реализовать через Observer
			this.keepMoveInStory(firstFigure, previousPos, secondFigure, swap);
		} else {
			this.newGame();
		}
	}

	closeModalWnd() {
		this.view.creatModalWnd();
	}
}
