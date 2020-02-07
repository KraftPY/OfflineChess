import { PubSub } from './PubSub/PubSub.js';
import { ControllerChessBoard } from './ChessBoard/ControllerChessBoard.js';
import { ControllerHistoryOfMoves } from './HistoryOfMoves/ControllerHistoryOfMoves.js';
import { ControllerStartGame } from './startGame/ControllerStartGame.js';

// ---------------------Start-------------------------------

const publisher = new PubSub();
const newGame = new ControllerStartGame(publisher);
const chessBoard = new ControllerChessBoard(publisher);
const historyOfMoves = new ControllerHistoryOfMoves(publisher);
