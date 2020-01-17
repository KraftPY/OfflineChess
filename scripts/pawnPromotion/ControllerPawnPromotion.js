import { ViewPawnPromotion } from './ViewPawnPromotion.js';
import { ModelPawnPromotion } from './ModelPawnPromotion.js';
// import { arrFigures } from '../main.js'; 			//ToDo: если импортировать лучше, то здесь или в Контролере єто делать надо?

export class ControllerPawnPromotion {
	constructor(publisher, arrPieces) {
		this.view = new ViewPawnPromotion();
		this.model = new ModelPawnPromotion(arrPieces);
		this.piece = {};
		publisher.subscribe('pawnPromotion', this.startPromotion.bind(this));
	}

	startPromotion(position) {
		this.piece = this.model.getPiece(position);
		this.view.renderModalPromotion(
			this.piece.color,
			this.changePiece.bind(this)
		);
	}

	changePiece(className) {
		// const
	}
}

// function pawnPromotion() {
// 	if (
// 		tempFigure.firstSelectedFigure.color == 'black' &&
// 		dom.blackOut.children.length
// 	) {
// 		swapOutVsChoose('black');
// 	} else if (
// 		tempFigure.firstSelectedFigure.color == 'white' &&
// 		dom.whiteOut.children.length
// 	) {
// 		swapOutVsChoose('white');
// 	}
// }

// function swapOutVsChoose(color, outToChoose = true) {
// 	const parent = color == 'black' ? dom.blackOut : dom.whiteOut;
// 	if (outToChoose) {
// 		const divChooseFigure = createModalWndSwap();
// 		arrFigures.forEach((el) => {
// 			if (el.figure.classList.contains('figures_out') && el.color == color) {
// 				el.figure.classList.remove('figures_out');
// 				el.figure.classList.add('figures_choose');
// 				el.add(divChooseFigure);
// 			}
// 		});
// 	} else {
// 		arrFigures.forEach((el) => {
// 			if (el.figure.classList.contains('figures_choose') && el.color == color) {
// 				el.figure.classList.remove('figures_choose');
// 				el.figure.classList.add('figures_out');
// 				el.add(parent);
// 			}
// 		});
// 	}
// }

// function createModalWndSwap() {
// 	const divChooseFigure = document.createElement('div'),
// 		btnOK = document.createElement('button');
// 	dom.mainModalSwap = document.createElement('div');

// 	dom.mainModalSwap.classList.add('modal_window');
// 	divChooseFigure.classList.add('choose_out');
// 	btnOK.classList.add('ok');
// 	btnOK.innerText = 'Select figure';
// 	dom.mainModalSwap.append(divChooseFigure, btnOK);
// 	document.body.append(dom.mainModalSwap);
// 	btnOK.addEventListener('click', () => swapFigure());
// 	return divChooseFigure;
// }

// function swapFigure() {
// 	let parent = tempFigure.firstSelectedFigure.parent,
// 		previousPos = tempFigure.firstSelectedFigure.pos;

// 	tempFigure.firstSelectedFigure.add(tempFigure.secondSelectedFigure.parent);
// 	tempFigure.firstSelectedFigure.addClass = 'figures_choose';
// 	tempFigure.secondSelectedFigure.add(parent, previousPos);
// 	tempFigure.secondSelectedFigure.removeClass = 'figures_choose';
// 	tempFigure.secondSelectedFigure.removeClass = 'choosed';
// 	swapOutVsChoose(tempFigure.secondSelectedFigure.color, false);
// 	dom.mainModalSwap.remove();
// 	dom.mainModalSwap = null;
// 	firstInCheckKing = inCheck().status;
// 	keepMoveInStory(
// 		tempFigure.firstSelectedFigure,
// 		previousPos,
// 		tempFigure.secondSelectedFigure,
// 		true
// 	);
// 	clearChessBoard();
// }
