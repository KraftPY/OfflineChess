export class ViewHistoryOfMoves {
	constructor(stepBackInHistoryMoves) {
		this.dom = {
			listMoves: document.querySelector('.list_moves'),
			scrollList: document.querySelector('.story_list')
		};
		this.stepBackInHistoryMoves = stepBackInHistoryMoves;
	}

	addNewMoveToList({ firstPiece, secondPiece, previousPos }) {
		const listElement = document.createElement('li');
		const symbol = 'abcdefgh'.split(''),
			number = '87654321'.split('');

		let fPieceName = firstPiece.pieceName[0].toUpperCase() + firstPiece.pieceName.slice(1);

		listElement.addEventListener('click', this.stepBackInHistoryMoves);
		if (firstPiece.isPromotion) {
			listElement.innerHTML = `Pawn (${firstPiece.color}) promoted to a ${fPieceName}`;
		} else {
			listElement.innerHTML = `${fPieceName} (${firstPiece.color}) - ${symbol[previousPos.x - 1]}${
				number[previousPos.y - 1]
			} move to ${symbol[firstPiece.pos.x - 1]}${number[firstPiece.pos.y - 1]}`;
			if (secondPiece && firstPiece.color != secondPiece.color) {
				let sPieceName = secondPiece.pieceName[0].toUpperCase() + secondPiece.pieceName.slice(1),
					// if en passant
					enPas = sPieceName == 'Pawn' && secondPiece.isFirstMove ? `"en passant"` : '';

				listElement.innerHTML += `<br>(taked ${sPieceName} ${enPas} (${secondPiece.color}))`;

				// Castling
			} else if (secondPiece && firstPiece.color == secondPiece.color) {
				let sPieceName = secondPiece.pieceName[0].toUpperCase() + secondPiece.pieceName.slice(1);
				listElement.innerHTML += `<br>(Castling with ${sPieceName} (${secondPiece.color}))`;
			}
		}

		this.dom.listMoves.append(listElement);
		this.dom.scrollList.scrollTop = this.dom.scrollList.scrollHeight;
	}

	selectListElement(elem) {
		let isFindElem = false;
		this.dom.listMoves.childNodes.forEach((el) => {
			if (isFindElem) {
				el.classList.add('following_li');
			} else {
				el.classList.remove('following_li');
			}
			if (el == elem) isFindElem = true;
		});
	}

	getNumMove(move) {
		return [...this.dom.listMoves.childNodes].findIndex((el) => el === move);
	}

	checkChoosedMoves() {
		let num = [...this.dom.listMoves.childNodes].findIndex((el) => el.classList.contains('following_li'));
		if (num > -1) {
			const len = this.dom.listMoves.childNodes.length;
			for (let i = len - 1; i > num - 1; i--) {
				this.dom.listMoves.childNodes[i].remove();
			}
			return num;
		} else {
			return false;
		}
	}
}
