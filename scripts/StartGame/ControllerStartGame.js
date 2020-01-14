import { ViewStartGame } from './ViewStartGame.js';
import { ModelStartGame } from './ModelStartGame.js';
import * as allClassesFigures from '../ChessPiece/ControllerChessPiece.js';
import { arrFigures, keepMoveInStory } from '../main.js';
import { TemplateStartGame } from './TemplateStartGame.js';

export class ControllerStartGame {
	constructor() {
		this.model = new ModelStartGame();
		this.view = new ViewStartGame();
		this.modalWnd = TemplateStartGame.getModalWnd();
		this.arrFigures = arrFigures;
		this.keepMoveInStory = keepMoveInStory;
		this.allClassesFigures = allClassesFigures;
		this.view.creatModalWnd(
			this.modalWnd,
			this.newGame.bind(this),
			this.loadGame.bind(this)
		);
	}

	newGame() {
		this.view.newGame(this.allClassesFigures);
		this.view.closeModalWnd();
	}

	loadGame() {
		const saveGame = this.model.getSaveGameFromLS();
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
