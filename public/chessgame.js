const socket = io();
const chess = new Chess();
const boardElement = document.querySelector('.chessboard');

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const getPieceUnicode = (piece) => {
    const uniquePieces = {
        p: '♙', r: '♖', n: '♘', b: '♗', q: '♕', k: '♔',
        P: '♟', R: '♜', N: '♞', B: '♝', Q: '♛', K: '♚'
    };
    return uniquePieces[piece.type.toLowerCase()] || "";
}

const renderBoard = () => {
    console.log('Rendering board');
    const board = chess.board();
    boardElement.innerHTML = '';

    board.forEach((row, rowIndex) => {
        row.forEach((square, squareIndex) => {
            const squareElement = document.createElement('div');
            squareElement.classList.add('square', (rowIndex + squareIndex) % 2 === 0 ? 'light' : 'dark');
            squareElement.dataset.row = rowIndex;
            squareElement.dataset.col = squareIndex;

            if (square) {
                const pieceElement = document.createElement('div');
                pieceElement.classList.add('piece', square.color === 'w' ? 'white' : 'black');
                pieceElement.innerText = getPieceUnicode(square);
                pieceElement.draggable = square.color === playerRole;
                pieceElement.addEventListener('dragstart', (e) => {
                    draggedPiece = pieceElement;
                    sourceSquare = { row: rowIndex, col: squareIndex };
                    e.dataTransfer.setData('text/plain', '');
                });
                squareElement.appendChild(pieceElement);
            }

            squareElement.addEventListener('dragover', (e) => e.preventDefault());

            squareElement.addEventListener('drop', (e) => {
                if (draggedPiece) {
                    const targetSquare = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col)
                    };
                    handleMove(sourceSquare, targetSquare);
                }
            });
            boardElement.appendChild(squareElement);
        });
    });
}

const handleMove = (source, target) => {
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`
    };
    console.log('Attempting move:', move);
    socket.emit('move', move);
}

socket.on('playerRole', (role) => {
    playerRole = role;
    console.log('Assigned role:', role);
    renderBoard();
});

socket.on('boardState', (fen) => {
    chess.load(fen);
    console.log('Updated board state:', fen);
    renderBoard();
});

socket.on('move', (move) => {
    chess.move(move);
    renderBoard();
});

socket.on('invalidMove', (msg) => {
    alert(msg);
});
