import { ModelHistoryOfMoves } from './ModelHistoryOfMoves.js';
import { ViewHistoryOfMoves } from './ViewHistoryOfMoves.js';

export class ControllerHistoryOfMoves {
	constructor(publisher) {
		this.model = new ModelHistoryOfMoves();
		this.view = new ViewHistoryOfMoves(this.stepBackInHistoryMoves.bind(this));
		this.publisher = publisher;
		this.publisher.subscribe('moveEnd', this.addNewMove.bind(this));
		this.publisher.subscribe('loadGame', this.loadGame.bind(this));
	}

	addNewMove() {
		const num = this.view.checkChoosedMoves();
		if (num) {
			this.model.deleteChoosedMovesFromLS(num);
		}
		const move = this.model.getMoveFromLocalStorage();
		this.view.addNewMoveToList(move);
	}

	stepBackInHistoryMoves(ev) {
		this.view.selectListElement(ev.target);
		const num = this.view.getNumMove(ev.target);
		this.publisher.publish('moveBack', num);
	}

	loadGame() {
		const allHistoryMoves = this.model.getAllMoveFromLS();
		allHistoryMoves.forEach((el) => {
			this.view.addNewMoveToList(el);
		});
	}
}
