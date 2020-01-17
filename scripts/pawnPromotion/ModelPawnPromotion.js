// import { arrFigures } from '../main.js'; // ToDo: если импортировать лучше, то здесь или в Контролере єто делать надо?

export class ModelPawnPromotion {
	constructor(arrPieces) {
		this.arrPieces = arrPieces;
	}

	getPiece(position) {
		return this.arrPieces.find((el) => el.pos == position);
	}
}
