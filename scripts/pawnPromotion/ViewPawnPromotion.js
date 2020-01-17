import { TemplatePawnPromotion } from './TemplatePawnPromotion.js'; // ToDO???????

export class ViewPawnPromotion {
	constructor() {
		this.dom = {
			body: document.querySelector('body')
		};
	}

	renderModalPromotion(color, changePiece) {
		this.mainModal = document.createElement('div');
		this.mainModal.classList.add('modal_window');
		this.mainModal.innerHTML = TemplatePawnPromotion.getModalWnd(color);
		this.dom.body.prepend(this.mainModal);

		// Listener
		const arrPiece = document.querySelectorAll('.figures_choose');
		let selectedClass = null;
		arrPiece.forEach((piece) => {
			piece.addEventListener('click', (ev) => {
				selectedClass = ev.target.classList[1];
				arrPiece.forEach((el) => el.classList.remove('choosed'));
				ev.target.classList.add('choosed');
			});
		});
		this.btn = document.querySelector('.ok');
		this.btn.addEventListener('click', () => {
			if (selectedClass) {
				changePiece(selectedClass);
				this.closeModalWnd();
			} else {
				alert('Выберите фигуру!');
			}
		});
	}

	closeModalWnd() {
		this.mainModal.remove();
	}
}
