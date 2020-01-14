export class TemplateStartGame {
	static getModalWnd() {
		return `<div class="modal_window">
			<div class="q_form">
				<p class="question">Вы хотите начать новую игру или продолжить предыдущую?</p>
				<div class="container_btn">
					<button class="btn_new">Начать новую</button>
					<button class="btn_load">Продолжить</button>
				</div>
			</div>
			</div>`;
	}
}
