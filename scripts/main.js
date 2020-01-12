
const   dom = {
            board: document.querySelector('.board'),            // chess board
            whiteOut: document.querySelector('.white_out'),     // the place where the dead white figure are stored
            blackOut: document.querySelector('.black_out'),     // the place where the dead black figure are stored
            mainModalSwap: null,
            listStory: document.querySelector('.list_moves'),
            scrollList: document.querySelector('.story_list')
        };
        

let     firstSelectedFigure = null,                 // временная переменная где хранится выбраная первая фигура
        secondSelectedFigure = null,                // временная переменная где хранится вторая фигура, если первая уже выбрана
        arrTableCells = (() => [...dom.board.rows].map((row) => [...row.children].map((col) => col)))(),
        arrFigures = [],
        historyMove = [],
        firstCheckKing = false;

// очищаем все ячейки от классов 'figureMove' и 'figureKill' и обнуляем временные переменные firstSelectedFigure и secondSelectedFigure
function clearBoard(onlyMoves = false) {    
    if (onlyMoves) {
        [...dom.board.rows].forEach((row) => [...row.children].forEach((col) => col.classList.remove('figureMove', 'figureKill')));    
    } else {
        [...dom.board.rows].forEach((row) => [...row.children].forEach((col) => col.classList.remove('figureMove', 'figureKill')));
        (firstSelectedFigure) ? firstSelectedFigure.removeClass = 'choosed' : false;
        (dom.mainModalSwap) ? true : firstSelectedFigure = null;
        secondSelectedFigure = null;
    }
}

function pawnEndBoard() {
    if (firstSelectedFigure.color == 'black' && dom.blackOut.children.length) {
        swapOutVsChoose('black');
    }else if (firstSelectedFigure.color == 'white' && dom.whiteOut.children.length){
        swapOutVsChoose('white');
    }
}

function swapOutVsChoose(color, outToChoose = true) {
    const   parent = (color == 'black') ? dom.blackOut : dom.whiteOut;
    if (outToChoose) {
        const   divChooseFigure = createModalWndSwap();
        arrFigures.forEach((el)=>{
            if (el.figure.classList.contains('figures_out') && el.color == color) {
                el.figure.classList.remove('figures_out');
                el.figure.classList.add('figures_choose');
                el.add(divChooseFigure);
            }
        });
    }else{
        arrFigures.forEach((el)=>{
            if (el.figure.classList.contains('figures_choose') && el.color == color) {
                el.figure.classList.remove('figures_choose');
                el.figure.classList.add('figures_out');
                el.add(parent);
            }
        });
    }
}

function createModalWndSwap() {
    const   divChooseFigure = document.createElement('div'),
            btnOK = document.createElement('button');
    dom.mainModalSwap = document.createElement('div');        

    dom.mainModalSwap.classList.add('modal_window');
    divChooseFigure.classList.add('choose_out');
    btnOK.classList.add('ok');
    btnOK.innerText = 'Select figure';
    dom.mainModalSwap.append(divChooseFigure, btnOK);
    document.body.append(dom.mainModalSwap);
    btnOK.addEventListener('click', () => swapFigure());
    return divChooseFigure;
}

function swapFigure() {
    let parent = firstSelectedFigure.parent,
        previousPos = firstSelectedFigure.pos;

    firstSelectedFigure.add(secondSelectedFigure.parent);
    firstSelectedFigure.addClass = 'figures_choose';
    secondSelectedFigure.add(parent, previousPos);
    secondSelectedFigure.removeClass = 'figures_choose';
    secondSelectedFigure.removeClass = 'choosed';
    swapOutVsChoose(secondSelectedFigure.color, false);
    dom.mainModalSwap.remove();
    dom.mainModalSwap = null;
    firstCheckKing = checkToTheKing().status;
    keepMoveInStory(firstSelectedFigure, previousPos, secondSelectedFigure, true);
    clearBoard();
}

document.addEventListener('DOMContentLoaded', startGame);
document.addEventListener('keydown', (ev) => (ev.code == 'Escape') ? clearBoard() : false);
dom.board.addEventListener('click', (ev) => {
    // ход в пустую ячейку
    if (ev.target.tagName == 'TD' && firstSelectedFigure) {
        // если ячейка с классом figureMove (этим классом помечены ячейки куда фигура может ходить)
        if (ev.target.classList.contains('figureMove')) {
            let previousPos = firstSelectedFigure.pos,
                previousParent = firstSelectedFigure.parent;
            firstSelectedFigure.add(ev.target, pos = {x: ev.target.cellIndex, y: ev.target.parentElement.rowIndex});

            // (если шах королю и после хода фигуры шах не пропал) или (после хода фигуры шах королю и фигура одного цвета с королем)
            let checkKing = checkToTheKing();
            if ((firstCheckKing && checkKing.status) || (checkKing.status && firstSelectedFigure.color == checkKing.king.color)) {
                firstSelectedFigure.add(previousParent, previousPos);
            }else{
                keepMoveInStory(firstSelectedFigure, previousPos);
            }
            
            // если пешка дошла до конца доски
            if (firstSelectedFigure instanceof Pawn && (firstSelectedFigure.pos.y == 1 || firstSelectedFigure.pos.y == 8)) {
                pawnEndBoard(firstSelectedFigure);
            }
        }
        firstCheckKing = checkToTheKing().status;
        clearBoard();
        
    // ход в ячейку где есть фигура
    } else if (firstSelectedFigure && secondSelectedFigure && !(secondSelectedFigure instanceof King)) {
        // если ячейка с классом figureKill (этим классом помечены ячейки куда фигура может ходить и где находится другая фигура)
        if (secondSelectedFigure.parent.classList.contains('figureKill')) {
            let parent = secondSelectedFigure.parent,
                pos = secondSelectedFigure.pos,
                previousPos = firstSelectedFigure.pos,
                previousParent = firstSelectedFigure.parent;
            // если вторая(битая) фигура черного цвета, тогда она перемещается в блок убитых фигур "div.black_out"
            if(secondSelectedFigure.color == 'black'){
                secondSelectedFigure.add(dom.blackOut);
                secondSelectedFigure.addClass = 'figures_out';
            // если белая, то в блок "div.white_out"
            }else {
                secondSelectedFigure.add(dom.whiteOut);
                secondSelectedFigure.addClass = 'figures_out';
            }
            firstSelectedFigure.add(parent, pos = {x: parent.cellIndex, y: parent.parentElement.rowIndex});

            // (если шах королю и после хода фигуры шах не пропал) или (после хода фигуры шах королю и фигура одного цвета с королем)
            let checkKing = checkToTheKing();
            if ((firstCheckKing && checkKing.status) || (checkKing.status && firstSelectedFigure.color == checkKing.king.color)) {
                firstSelectedFigure.add(previousParent, previousPos);
                secondSelectedFigure.add(parent, pos);
                secondSelectedFigure.removeClass = 'figures_out';
            }else{
                keepMoveInStory(firstSelectedFigure, previousPos, secondSelectedFigure);
            }
           
            // если пешка дошла до конца доски
            if (firstSelectedFigure instanceof Pawn && (firstSelectedFigure.pos.y == 1 || firstSelectedFigure.pos.y == 8)) {
                pawnEndBoard();
            }
        }
        firstCheckKing = checkToTheKing().status;
        clearBoard();
    }
});

function keepMoveInStory(firstFigure, previousPos, secondFigure = null, swap = false) {
    const moveFigure = new MoveFigure(arrFigures, firstFigure.color);
    
    if (historyMove.length) {
        historyMove = historyMove.filter((el)=> {
            if (!el.li.classList.contains('following_li')) return el;
            else el.li.remove();
        });
    }
    moveFigure.addToList(firstFigure, previousPos, secondFigure, swap);
}

function checkToTheKing() {
    const   whiteKing = arrFigures.find((el) => el.color != 'white' && el instanceof King),
            blackKing = arrFigures.find((el) => el.color != 'black' && el instanceof King),
            checkKing = {status : false, king : null};

    clearBoard(true);
    arrFigures.forEach((el)=>{
        el.moves();
        if (whiteKing.parent.classList.contains('figureKill')) {
            checkKing.status = true;
            checkKing.king = whiteKing;
            blinkingKing(whiteKing.parent);
        } else if (blackKing.parent.classList.contains('figureKill')) {
            checkKing.status = true;
            checkKing.king = blackKing;
            blinkingKing(blackKing.parent);
        }
    });
    clearBoard(true);
    return checkKing;
}

function blinkingKing(cell) {
    cell.classList.add('blinking');
    setTimeout(() => cell.classList.remove('blinking'), 2000);
}
// ---------------------------------- Classes---------------------------------
class ChessFigure {
    constructor(){
        this.figure = document.createElement('div');
        this.figure.addEventListener('click', () => this.click());
        arrFigures.push(this);
    }

    add(parent, pos = {x: 0, y: 0}){
        this.parent = parent;
        this.pos = pos;
        parent.append(this.figure);
    }

    set addClass(nameClass){
        this.figure.classList.add(nameClass);
        this.color = (() => {
            if (nameClass.includes('_black')) return 'black';
            else if (nameClass.includes('_white')) return 'white';
            else return this.color;
        })();
    }

    set removeClass(nameClass){
        this.figure.classList.remove(nameClass);
    }

    click(){
        let tempHistory = historyMove.filter((el)=> !el.li.classList.contains('following_li'));
        const lastMoveColor = (tempHistory.length) ? tempHistory[tempHistory.length - 1].color : '';
            if ((!this.figure.classList.contains('figures_out')) && (firstSelectedFigure != this) && (!this.figure.classList.contains('figures_choose'))) {
                if(firstSelectedFigure) {
                    if (firstSelectedFigure.color == this.color) {
                        clearBoard();
                        firstSelectedFigure = this;
                        this.addClass = 'choosed';
                        this.moves();    
                    }else if ((this.parent.classList.contains('figureMove') || this.parent.classList.contains('figureKill')) && this.color == lastMoveColor) {
                        secondSelectedFigure = this;
                    }
                } else if (this.color != lastMoveColor){
                    firstSelectedFigure = this;
                    this.addClass = 'choosed';
                    firstSelectedFigure.moves();
                }
            }else if (firstSelectedFigure == this){
                this.removeClass = 'choosed';
                clearBoard();
            }else if (this.figure.classList.contains('figures_choose')) {
                this.parent.childNodes.forEach((el)=> el.classList.remove('choosed'));
                this.addClass = 'choosed';
                secondSelectedFigure = this;
            }
    }

    showMoves(arrMoveCells = [], arrKillCells = []){
        [...dom.board.rows].forEach((row, i) => {
            [...row.children].forEach((col, j) => {
                // проверяем текущую ячейку есть ли она в массиве доступных ходов
                if (arrMoveCells.find((el) => el.x == j && el.y == i)) {
                    // если ячейка без фигуры, тогда ставим класс 'figureMove'
                    if (!col.childElementCount) col.classList.add('figureMove');
                    // если ячейка с фигурой, то проверяем какого цвета фигура и ходящая фигура не пешка, тогда ставим класс 'figureKill'
                    else if (!col.children[0].className.includes(this.color) && !arrKillCells.length) col.classList.add('figureKill');
                // проверяем текущую ячейку есть ли она в массиве ходов только для пешек и если фигура другого цвета, тогда ставим класс 'figureKill'
                } else if (arrKillCells.find((el) => el.x == j && el.y == i) && col.childElementCount && !col.children[0].className.includes(this.color)){ 
                    col.classList.add('figureKill');
                }
            });
        });
    }
}

class King extends ChessFigure{
    moves(){
        let arrMoveCells = [];

        if (this.pos.y > 1 && this.pos.y < 8 && this.pos.x > 1 && this.pos.x < 8) {
            for (let i = this.pos.y - 1; i < this.pos.y + 2; i++) {
                for (let j = this.pos.x - 1; j < this.pos.x + 2; j++) {
                    arrMoveCells.push({y: i, x: j});                    
                }                
            }
        } else if (this.pos.y == 8 && this.pos.x > 1 && this.pos.x < 8){
            for (let i = this.pos.y - 1; i < this.pos.y + 1; i++) {
                for (let j = this.pos.x - 1; j < this.pos.x + 2; j++) {
                    arrMoveCells.push({y: i, x: j});                    
                }                
            }
        } else if (this.pos.y == 1 && this.pos.x > 1 && this.pos.x < 8){
            for (let i = this.pos.y; i < this.pos.y + 2; i++) {
                for (let j = this.pos.x - 1; j < this.pos.x + 2; j++) {
                    arrMoveCells.push({y: i, x: j});                    
                }                
            }
        } else if (this.pos.y > 1 && this.pos.y < 8 && this.pos.x == 8){
            for (let i = this.pos.y - 1; i < this.pos.y + 2; i++) {
                for (let j = this.pos.x - 1; j < this.pos.x + 1; j++) {
                    arrMoveCells.push({y: i, x: j});                    
                }                
            }
        } else if (this.pos.y > 1 && this.pos.y < 8 && this.pos.x == 1){
            for (let i = this.pos.y - 1; i < this.pos.y + 2; i++) {
                for (let j = this.pos.x; j < this.pos.x + 2; j++) {
                    arrMoveCells.push({y: i, x: j});                    
                }                
            }
        } else if (this.pos.y == 1 && this.pos.x == 1) arrMoveCells.push({y: 1, x: 2},{y: 2, x: 2},{y: 2, x: 1});
        else if (this.pos.y == 1 && this.pos.x == 8) arrMoveCells.push({y: 1, x: 7},{y: 2, x: 7},{y: 2, x: 8});
        else if (this.pos.y == 8 && this.pos.x == 8) arrMoveCells.push({y: 8, x: 7},{y: 7, x: 7},{y: 7, x: 8});
        else if (this.pos.y == 8 && this.pos.x == 1) arrMoveCells.push({y: 7, x: 1},{y: 7, x: 2},{y: 8, x: 2});
        
        this.showMoves(arrMoveCells);
    }
}

class Queen extends ChessFigure{
    moves(){
        let arrMoveCells = [],
            diffNum = null;
        
        // up-left move
        diffNum = this.pos.x - this.pos.y;
        end1:
            for (let i = this.pos.y - 1; i > 0; i--) {
                for (let j = this.pos.x - 1; j > 0; j--) {
                    if (j - i == diffNum){
                        if (!arrTableCells[i][j].childElementCount) arrMoveCells.push({y: i, x: j});
                        else {arrMoveCells.push({y: i, x: j}); break end1;}
                    }            
                }
            }
            
        // down-left move
        diffNum = this.pos.x + this.pos.y;
        end2:
            for (let i = this.pos.y + 1; i < 9; i++) {
                for (let j = this.pos.x - 1; j > 0; j--) {
                    if (j + i == diffNum){
                        if (!arrTableCells[i][j].childElementCount) arrMoveCells.push({y: i, x: j});
                        else {arrMoveCells.push({y: i, x: j}); break end2;}
                    }
                }
            }
        
        // up-right move 
        diffNum = this.pos.x + this.pos.y;
        end3:
            for (let i = this.pos.y - 1; i > 0; i--) {
                for (let j = this.pos.x + 1; j < 9; j++) {
                    if (j + i == diffNum){
                        if (!arrTableCells[i][j].childElementCount) arrMoveCells.push({y: i, x: j});
                        else {arrMoveCells.push({y: i, x: j}); break end3;}
                    }
                }
            }
        
        // down-right move
        diffNum = this.pos.x - this.pos.y;
        end4:
            for (let i = this.pos.y + 1; i < 9; i++) {
                for (let j = this.pos.x + 1; j < 9; j++) {
                    if (j - i == diffNum){
                        if (!arrTableCells[i][j].childElementCount) arrMoveCells.push({y: i, x: j});
                        else {arrMoveCells.push({y: i, x: j}); break end4;}
                    }
                }
            }

        // up move
        for (let i = this.pos.y - 1; i > 0; i--) {
            if (!arrTableCells[i][this.pos.x].childElementCount) arrMoveCells.push({y: i, x: this.pos.x});
            else {arrMoveCells.push({y: i, x: this.pos.x}); break;}
        }

        // down move
        for (let i = this.pos.y + 1; i < 9; i++) {
            if (!arrTableCells[i][this.pos.x].childElementCount) arrMoveCells.push({y: i, x: this.pos.x});
            else {arrMoveCells.push({y: i, x: this.pos.x}); break;}
        }
    
        // right move 
        for (let i = this.pos.x + 1; i < 9; i++) {
            if (!arrTableCells[this.pos.y][i].childElementCount) arrMoveCells.push({y: this.pos.y, x: i});
            else {arrMoveCells.push({y: this.pos.y, x: i}); break;}
        }

        // left move
        for (let i = this.pos.x - 1; i > 0; i--) {
            if (!arrTableCells[this.pos.y][i].childElementCount) arrMoveCells.push({y: this.pos.y, x: i});
            else {arrMoveCells.push({y: this.pos.y, x: i}); break;}
        }

        this.showMoves(arrMoveCells);
    }
}

class Elephant extends ChessFigure{
    moves(){
        let arrMoveCells = [],
            diffNum = null;
        // up-left move
        diffNum = this.pos.x - this.pos.y;
        end1:
            for (let i = this.pos.y - 1; i > 0; i--) {
                for (let j = this.pos.x - 1; j > 0; j--) {
                    if (j - i == diffNum){
                        if (!arrTableCells[i][j].childElementCount) arrMoveCells.push({y: i, x: j});
                        else {arrMoveCells.push({y: i, x: j}); break end1;}
                    }            
                }
            }
            
        // down-left move
        diffNum = this.pos.x + this.pos.y;
        end2:
            for (let i = this.pos.y + 1; i < 9; i++) {
                for (let j = this.pos.x - 1; j > 0; j--) {
                    if (j + i == diffNum){
                        if (!arrTableCells[i][j].childElementCount) arrMoveCells.push({y: i, x: j});
                        else {arrMoveCells.push({y: i, x: j}); break end2;}
                    }
                }
            }
        
        // up-right move 
        diffNum = this.pos.x + this.pos.y;
        end3:
            for (let i = this.pos.y - 1; i > 0; i--) {
                for (let j = this.pos.x + 1; j < 9; j++) {
                    if (j + i == diffNum){
                        if (!arrTableCells[i][j].childElementCount) arrMoveCells.push({y: i, x: j});
                        else {arrMoveCells.push({y: i, x: j}); break end3;}
                    }
                }
            }
        
        // down-right move
        diffNum = this.pos.x - this.pos.y;
        end4:
            for (let i = this.pos.y + 1; i < 9; i++) {
                for (let j = this.pos.x + 1; j < 9; j++) {
                    if (j - i == diffNum){
                        if (!arrTableCells[i][j].childElementCount) arrMoveCells.push({y: i, x: j});
                        else {arrMoveCells.push({y: i, x: j}); break end4;}
                    }
                }
            }


        this.showMoves(arrMoveCells);
    }
}

class Horse extends ChessFigure{
    moves(){
        let arrMoveCells = [];
            
            // up move
            if      (this.pos.y > 2 && this.pos.x != 8 && this.pos.x != 1)  arrMoveCells.push({y: this.pos.y - 2, x: this.pos.x - 1},{y: this.pos.y - 2, x: this.pos.x + 1});
            else if (this.pos.y > 2 && this.pos.x == 8)                     arrMoveCells.push({y: this.pos.y - 2, x: this.pos.x - 1});
            else if (this.pos.y > 2 && this.pos.x == 1)                     arrMoveCells.push({y: this.pos.y - 2, x: this.pos.x + 1});

            // down move
            if      (this.pos.y < 7 && this.pos.x != 8 && this.pos.x != 1)  arrMoveCells.push({y: this.pos.y + 2, x: this.pos.x - 1},{y: this.pos.y + 2, x: this.pos.x + 1});
            else if (this.pos.y < 7 && this.pos.x == 8)                     arrMoveCells.push({y: this.pos.y + 2, x: this.pos.x - 1});
            else if (this.pos.y < 7 && this.pos.x == 1)                     arrMoveCells.push({y: this.pos.y + 2, x: this.pos.x + 1});

            // left move
            if      (this.pos.x > 2 && this.pos.y != 8 && this.pos.y != 1)  arrMoveCells.push({y: this.pos.y - 1, x: this.pos.x - 2},{y: this.pos.y + 1, x: this.pos.x - 2});
            else if (this.pos.x > 2 && this.pos.y == 8)                     arrMoveCells.push({y: this.pos.y - 1, x: this.pos.x - 2});
            else if (this.pos.x > 2 && this.pos.y == 1)                     arrMoveCells.push({y: this.pos.y + 1, x: this.pos.x - 2});

            // right move
            if      (this.pos.x < 7 && this.pos.y != 8 && this.pos.y != 1)  arrMoveCells.push({y: this.pos.y - 1, x: this.pos.x + 2},{y: this.pos.y + 1, x: this.pos.x + 2});
            else if (this.pos.x < 7 && this.pos.y == 8)                     arrMoveCells.push({y: this.pos.y - 1, x: this.pos.x + 2});
            else if (this.pos.x < 7 && this.pos.y == 1)                     arrMoveCells.push({y: this.pos.y + 1, x: this.pos.x + 2});

        this.showMoves(arrMoveCells);
    }
}

class Tower extends ChessFigure{
    moves(){
        let arrMoveCells = [];

        // up move
        for (let i = this.pos.y - 1; i > 0; i--) {
            if (!arrTableCells[i][this.pos.x].childElementCount) arrMoveCells.push({y: i, x: this.pos.x});
            else {arrMoveCells.push({y: i, x: this.pos.x}); break;}
        }

        // down move
        for (let i = this.pos.y + 1; i < 9; i++) {
            if (!arrTableCells[i][this.pos.x].childElementCount) arrMoveCells.push({y: i, x: this.pos.x});
            else {arrMoveCells.push({y: i, x: this.pos.x}); break;}
        }
    
        // right move 
        for (let i = this.pos.x + 1; i < 9; i++) {
            if (!arrTableCells[this.pos.y][i].childElementCount) arrMoveCells.push({y: this.pos.y, x: i});
            else {arrMoveCells.push({y: this.pos.y, x: i}); break;}
        }

        // left move
        for (let i = this.pos.x - 1; i > 0; i--) {
            if (!arrTableCells[this.pos.y][i].childElementCount) arrMoveCells.push({y: this.pos.y, x: i});
            else {arrMoveCells.push({y: this.pos.y, x: i}); break;}
        }

        this.showMoves(arrMoveCells);
    }
}

class Pawn extends ChessFigure{
    moves(){
        let arrMoveCells = [],
            arrKillCells = [];              // pos = {x: j, y: i});
        // 
        if (this.color == 'white') {
            // 
            if      ((this.pos.y == 7) && (!arrTableCells[6][this.pos.x].childElementCount))   arrMoveCells.push({y: this.pos.y - 1, x: this.pos.x},{y: this.pos.y - 2, x: this.pos.x});
            else if (this.pos.y > 1)    arrMoveCells.push({y: this.pos.y - 1, x: this.pos.x});
            // 
            if      (this.pos.x == 1)   arrKillCells.push({y: this.pos.y - 1, x: this.pos.x + 1});
            else if (this.pos.x == 8)   arrKillCells.push({y: this.pos.y - 1, x: this.pos.x - 1});
            else                        arrKillCells.push({y: this.pos.y - 1, x: this.pos.x - 1},{y: this.pos.y - 1, x: this.pos.x + 1});
        // 
        } else if (this.color == 'black'){
            // 
            if      ((this.pos.y == 2) && (!arrTableCells[3][this.pos.x].childElementCount))  arrMoveCells.push({y: this.pos.y + 1, x: this.pos.x},{y: this.pos.y + 2, x: this.pos.x});
            else if (this.pos.y < 8)    arrMoveCells.push({y: this.pos.y + 1, x: this.pos.x});
            // 
            if      (this.pos.x == 1)   arrKillCells.push({y: this.pos.y + 1, x: this.pos.x + 1});
            else if (this.pos.x == 8)   arrKillCells.push({y: this.pos.y + 1, x: this.pos.x - 1});
            else                        arrKillCells.push({y: this.pos.y + 1, x: this.pos.x - 1},{y: this.pos.y + 1, x: this.pos.x + 1});
        }
        (arrMoveCells.length) ? this.showMoves(arrMoveCells, arrKillCells) : false;
    }
}

class MoveFigure {
    constructor(allFigures, color){
        this.li = document.createElement('li');
        this.li.addEventListener('click', () => this.click());
        this.arrFiguresPosition = this.saveFigurePosition(allFigures);
        this.color = color;
        historyMove.push(this);
    }
    click(){
        this.arrFiguresPosition.forEach((el)=>{
            if (el.objFigure.parent != el.parent) {
                el.objFigure.add(el.parent, el.pos);
                el.objFigure.figure.className = el.className;
                el.objFigure.removeClass = 'choosed';
            }
        });
        let findEl = false;
        historyMove.forEach((el, i)=>{
            if (findEl) {
                el.li.classList.add('following_li');
            } else {
                el.li.classList.remove('following_li');
            }
            if (el == this) findEl = true;
        });
        firstCheckKing = checkToTheKing().status;
        clearBoard();
    }
    addToList(firstFigure, previousPos, secondFigure, swap){
        const   symbol = 'abcdefgh'.split(''),
                number = '87654321'.split(''),
                saveMove = { // объект для сохранения в LocalStorage последнего хода из list_moves 
                    'firstFigure': {
                            'figureName': firstFigure.constructor.name,
                            'color': firstFigure.color,
                            'previousPos': previousPos,
                            'nextPos': firstFigure.pos 
                        },
                    'secondFigure': {
                            'figureName': (secondFigure) ? secondFigure.constructor.name : false,
                            'color': (secondFigure) ? secondFigure.color : false
                        },
                    'swap': swap
                };

        if (swap) {
            this.li.innerHTML = `${firstFigure.constructor.name} (${firstFigure.color}) - ${symbol[previousPos.x - 1]}${number[previousPos.y - 1]} swap to <br>${secondFigure.constructor.name} (${secondFigure.color})`;
        } else {
            this.li.innerHTML = `${firstFigure.constructor.name} (${firstFigure.color}) - ${symbol[previousPos.x - 1]}${number[previousPos.y - 1]} move to ${symbol[firstFigure.pos.x - 1]}${number[firstFigure.pos.y - 1]}`;
            (secondFigure) ? this.li.innerHTML += `<br>(killed ${secondFigure.constructor.name} (${secondFigure.color}))`: false;   
        }
        dom.listStory.append(this.li);
        dom.scrollList.scrollTop = dom.scrollList.scrollHeight;
        this.saveHistoryToLocalStorage(this.arrFiguresPosition, saveMove);
    }
    saveFigurePosition(allFigures){
        return allFigures.map((el)=>{
            let figureData = {
                    objFigure: el,
                    parent: el.parent,
                    pos: el.pos,
                    className: el.figure.className
            };
            return figureData;
        });
    }

    // сохраняем в LocalStorage массив позиций всех фигур и последнюю запись(ход) из list_moves
    saveHistoryToLocalStorage(arrFiguresPosition, saveMove){
        let arr = arrFiguresPosition.map((el)=>{
            let figureData = {
                    figure : el.objFigure.constructor.name,
                    color : el.objFigure.color,
                    pos: el.pos,
                    out : (el.objFigure.figure.classList.contains('figures_out')) ? true : false
                };
            return figureData;
        });

        localStorage.setItem('history', JSON.stringify({'arrFigures': arr, 'lastMove': saveMove}));
    }
}

// ---------------------Start-------------------------------

function startGame() {
    const   mainModal = document.createElement('div'),
            modalForm = document.createElement('div'),
            question = document.createElement('p'),
            contBtn = document.createElement('div'),
            btnLoad = document.createElement('button'),
            btnNew = document.createElement('button');

    // Add classList
    mainModal.classList.add('modal_window');
    modalForm.classList.add('q_form');
    question.classList.add('question');
    contBtn.classList.add('container_btn');
    btnLoad.classList.add('btn_Load');
    btnNew.classList.add('btn_New');

    // Add content
    question.innerText = `Вы хотите начать новую игру или продолжить предыдущую?`;
    btnLoad.innerText = `Продолжить`;
    btnNew.innerText = `Начать новую`;

    contBtn.append(btnNew, btnLoad);
    modalForm.append(question, contBtn);
    mainModal.append(modalForm);
    document.querySelector('body').prepend(mainModal);

    // Listeners
    btnNew.addEventListener('click', newGame);
    btnLoad.addEventListener('click', loadGame);

    function closeModalWnd() {
        btnNew.removeEventListener('click', newGame);
        btnLoad.removeEventListener('click', loadGame);
        mainModal.remove();
    }

    function newGame() {
        [...dom.board.rows].forEach((row, i) => {
            [...row.children].forEach((col, j) => {
                // Black figures
                if ((i == 1 && j == 1) || (i == 1 && j == 8)) {
                    let figure  = new Tower();
                    figure.add(col, pos = {x: j, y: i});
                    figure.addClass =  'tower_black';
                } else if ((i == 1 && j == 2) || (i == 1 && j == 7)){
                    let figure  = new Horse();
                    figure.add(col, pos = {x: j, y: i});
                    figure.addClass =  'horse_black';
                } else if ((i == 1 && j == 3) || (i == 1 && j == 6)) {
                    let figure  = new Elephant();
                    figure.add(col, pos = {x: j, y: i});
                    figure.addClass =  'elephant_black';
                } else if (i == 1 && j == 4) {
                    let figure  = new Queen();
                    figure.add(col, pos = {x: j, y: i});
                    figure.addClass =  'queen_black';
                } else if (i == 1 && j == 5) {
                    let figure  = new King();
                    figure.add(col, pos = {x: j, y: i});
                    figure.addClass =  'king_black';
                } else if (i == 2 && j > 0 && j < 9) {
                    let figure  = new Pawn();
                    figure.add(col, pos = {x: j, y: i});
                    figure.addClass =  'pawn_black';
                }
                // White figures
                if ((i == 8 && j == 1) || (i == 8 && j == 8)) {
                    let figure  = new Tower();
                    figure.add(col, pos = {x: j, y: i});
                    figure.addClass =  'tower_white';
                } else if ((i == 8 && j == 2) || (i == 8 && j == 7)){
                    let figure  = new Horse();
                    figure.add(col, pos = {x: j, y: i});
                    figure.addClass =  'horse_white';
                } else if ((i == 8 && j == 3) || (i == 8 && j == 6)) {
                    let figure  = new Elephant();
                    figure.add(col, pos = {x: j, y: i});
                    figure.addClass =  'elephant_white';
                } else if (i == 8 && j == 4) {
                    let figure  = new Queen();
                    figure.add(col, pos = {x: j, y: i});
                    figure.addClass =  'queen_white';
                } else if (i == 8 && j == 5) {
                    let figure  = new King();
                    figure.add(col, pos = {x: j, y: i});
                    figure.addClass =  'king_white';
                } else if (i == 7 && j > 0 && j < 9) {
                    let figure  = new Pawn();
                    figure.add(col, pos = {x: j, y: i});
                    figure.addClass =  'pawn_white';
                }
            });
        });
        closeModalWnd();
    }
    
    function loadGame() {
        let historyFromLS = JSON.parse(localStorage.getItem('history'));
        if (historyFromLS){
            historyFromLS.arrFigures.forEach((el)=>{
                let figure;
                switch (el.figure) {
                    case 'Tower':
                        figure  = new Tower();
                        placeFigure(figure, el);
                        break;
                    case 'Horse':
                        figure  = new Horse();
                        placeFigure(figure, el);
                        break;
                    case 'Elephant':
                        figure  = new Elephant();
                        placeFigure(figure, el);
                        break;
                    case 'Queen':
                        figure  = new Queen();
                        placeFigure(figure, el);
                        break;
                    case 'King':
                        figure  = new King();
                        placeFigure(figure, el);
                        break;
                    case 'Pawn':
                        figure  = new Pawn();
                        placeFigure(figure, el);
                        break;
                
                    default:
                        break;
                }
            });
            closeModalWnd();
            addLastMove();
        }else{
            newGame();
            alert('Нет сохраненной партии!');
        }
        
        function placeFigure(figure, el){
            figure.addClass = (el.color == 'black')? el.figure.toLowerCase() + '_black' : el.figure.toLowerCase() + '_white';
            if (el.out) {
                (el.color == 'black')? figure.add(dom.blackOut, el.pos) : figure.add(dom.whiteOut, el.pos);
                figure.addClass = 'figures_out';
            } else {
                figure.add(arrTableCells[el.pos.y][el.pos.x], el.pos);
            }
        }

        function addLastMove() {
            let     firstFigure = null,
                    secondFigure = null;
            const   swap = historyFromLS.lastMove.swap;

            if (swap){
                firstFigure = arrFigures.find((el) => (el.color == historyFromLS.lastMove.firstFigure.color && el.constructor.name == historyFromLS.lastMove.firstFigure.figureName && el.figure.classList.contains('figures_out')));
                secondFigure = arrFigures.find((el) => (el.pos.x == historyFromLS.lastMove.firstFigure.previousPos.x && el.pos.y == historyFromLS.lastMove.firstFigure.previousPos.y));
            }else{
                firstFigure = arrFigures.find((el) => (el.pos.x == historyFromLS.lastMove.firstFigure.nextPos.x && el.pos.y == historyFromLS.lastMove.firstFigure.nextPos.y));
                if (historyFromLS.lastMove.secondFigure.figureName){
                    secondFigure = arrFigures.find((el) => (el.color == historyFromLS.lastMove.secondFigure.color && el.constructor.name == historyFromLS.lastMove.secondFigure.figureName && el.figure.classList.contains('figures_out')));
                }
            }

            keepMoveInStory(firstFigure, historyFromLS.lastMove.firstFigure.previousPos, secondFigure, swap);
        }
    }
}