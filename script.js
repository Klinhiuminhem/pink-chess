let boardSquaresArray = [];
let legalSquares = [];
let isWhiteTurn = true;
const boardSquares = document.getElementsByClassName("square");
const pieces = document.getElementsByClassName("piece");
const piecesImages = document.getElementsByTagName("img");
setupBoardSquares();
setupPieces();
fillBoardSquaresArray();

function fillBoardSquaresArray() {
    const boardSquares = document.getElementsByClassName("square");
    for (let i = 0; i < boardSquares.length; i++) {
        let row = 8 - Math.floor(i / 8);
        let column = String.fromCharCode(97 + (i % 8));
        let square = boardSquares[i];
        square.id = column + row;
        let color = "", pieceType = "", pieceId = "";
        if (square.querySelector(".piece")) {
            color = square.querySelector(".piece").getAttribute("color");
            pieceType = square.querySelector(".piece").classList[1];
            pieceId = square.querySelector(".piece").id;
        } else {
            color = "blank"; pieceType = "blank"; pieceId = "blank";
        }
        boardSquaresArray.push({ squareId: square.id, pieceColor: color, pieceType: pieceType, pieceId: pieceId });
    }
}

function setupBoardSquares() {
    for (let i = 0; i < boardSquares.length; i++) {
        boardSquares[i].addEventListener("dragover", allowDrop);
        boardSquares[i].addEventListener("drop", drop);
        let row = 8 - Math.floor(i / 8);
        let column = String.fromCharCode(97 + (i % 8));
        boardSquares[i].id = column + row;
    }
}

function setupPieces() {
    for (let i = 0; i < pieces.length; i++) {
        pieces[i].addEventListener("dragstart", drag);
        pieces[i].setAttribute("draggable", true);
        pieces[i].id = pieces[i].className.split(" ")[1] + pieces[i].parentElement.id;
    }
    for (let i = 0; i < piecesImages.length; i++) {
        piecesImages[i].setAttribute("draggable", false);
    }
}

function allowDrop(ev) { ev.preventDefault(); }

function drag(ev) {
    boardSquaresArray = [];
    fillBoardSquaresArray();
    const piece = ev.target;
    const pieceColor = piece.getAttribute("color");
    if ((isWhiteTurn && pieceColor === "white") || (!isWhiteTurn && pieceColor === "black")) {
        ev.dataTransfer.setData("text", piece.id);
        const startingSquareId = piece.parentNode.id;
        getPossibleMoves(startingSquareId, piece, boardSquaresArray);
        filterMovesForCheck(startingSquareId, pieceColor);
        const layer = document.querySelector('.highlight-layer');
        if (layer) layer.innerHTML = '';
        highlightSquares(legalSquares, startingSquareId);
    }
}

function drop(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text");
    if (!data) return;
    const piece = document.getElementById(data);
    if (!piece) return;

    const destinationSquare = ev.currentTarget;
    const destinationSquareId = destinationSquare.id;
    const layer = document.querySelector('.highlight-layer');
    if (layer) layer.innerHTML = '';

    if (legalSquares.includes(destinationSquareId)) {
        while (destinationSquare.firstChild) destinationSquare.removeChild(destinationSquare.firstChild);
        destinationSquare.appendChild(piece);
        isWhiteTurn = !isWhiteTurn;
        legalSquares = [];
        boardSquaresArray = [];
        fillBoardSquaresArray();

        const currentColor = isWhiteTurn ? "white" : "black";
        const opponentColor = isWhiteTurn ? "black" : "white";

        if (isCheckmate(currentColor, boardSquaresArray)) {
            showCheckNotification(currentColor);
            setTimeout(() => showGameOverModal("Checkmate! 🏆", `${opponentColor.charAt(0).toUpperCase() + opponentColor.slice(1)} wins!`), 600);
        } else if (isStalemate(currentColor, boardSquaresArray)) {
            setTimeout(() => showGameOverModal("Stalemate! 🤝", "It's a draw!"), 300);
        } else if (isKingInCheck(currentColor, boardSquaresArray)) {
            showCheckNotification(currentColor);
        }
    }
}

// ── Piece movement ───────────────────────────────────────────────

function getPossibleMoves(startingSquareId, piece, boardSquaresArray) {
    const pieceColor = piece.getAttribute("color");
    if (piece.classList.contains("pawn"))   getPawnMoves(startingSquareId, pieceColor, boardSquaresArray);
    if (piece.classList.contains("knight")) getKnightMoves(startingSquareId, pieceColor, boardSquaresArray);
    if (piece.classList.contains("rook"))   getRookMoves(startingSquareId, pieceColor, boardSquaresArray);
    if (piece.classList.contains("bishop")) getBishopMoves(startingSquareId, pieceColor, boardSquaresArray);
    if (piece.classList.contains("queen"))  getQueenMoves(startingSquareId, pieceColor, boardSquaresArray);
    if (piece.classList.contains("king"))   getKingMoves(startingSquareId, pieceColor, boardSquaresArray);
}

function getPawnMoves(startingSquareId, pieceColor, boardSquaresArray) {
    const captures = checkPawnDiagonalCaptures(startingSquareId, pieceColor, boardSquaresArray);
    const forwards = checkPawnForwardMoves(startingSquareId, pieceColor, boardSquaresArray);
    legalSquares = forwards.concat(captures);
}

function checkPawnDiagonalCaptures(startingSquareId, pieceColor, boardSquaresArray) {
    const file = startingSquareId.charAt(0);
    const rankNumber = parseInt(startingSquareId.charAt(1));
    let result = [];
    const direction = pieceColor === "white" ? 1 : -1;
    const captureRank = rankNumber + direction;
    for (let i = -1; i <= 1; i += 2) {
        const currentFile = String.fromCharCode(file.charCodeAt(0) + i);
        if (currentFile >= "a" && currentFile <= "h") {
            const id = currentFile + captureRank;
            const sq = boardSquaresArray.find(el => el.squareId === id);
            if (sq && sq.pieceColor !== "blank" && sq.pieceColor !== pieceColor) result.push(id);
        }
    }
    return result;
}

function checkPawnForwardMoves(startingSquareId, pieceColor, boardSquaresArray) {
    const file = startingSquareId.charAt(0);
    const rankNumber = parseInt(startingSquareId.charAt(1));
    let result = [];
    const direction = pieceColor === "white" ? 1 : -1;
    let currentRank = rankNumber + direction;
    let sq = boardSquaresArray.find(el => el.squareId === file + currentRank);
    if (!sq || sq.pieceColor !== "blank") return result;
    result.push(file + currentRank);
    if ((pieceColor === "white" && rankNumber === 2) || (pieceColor === "black" && rankNumber === 7)) {
        currentRank += direction;
        sq = boardSquaresArray.find(el => el.squareId === file + currentRank);
        if (sq && sq.pieceColor === "blank") result.push(file + currentRank);
    }
    return result;
}

function getKnightMoves(startingSquareId, pieceColor, boardSquaresArray) {
    const file = startingSquareId.charCodeAt(0) - 97;
    const rankNumber = parseInt(startingSquareId.charAt(1));
    legalSquares = [];
    [[-2,1],[-1,2],[1,2],[2,1],[2,-1],[1,-2],[-1,-2],[-2,-1]].forEach(([df, dr]) => {
        const f = file + df, r = rankNumber + dr;
        if (f >= 0 && f <= 7 && r >= 1 && r <= 8) {
            const id = String.fromCharCode(f + 97) + r;
            const sq = boardSquaresArray.find(el => el.squareId === id);
            if (sq && sq.pieceColor !== pieceColor) legalSquares.push(id);
        }
    });
}

function getRookMoves(startingSquareId, pieceColor, boardSquaresArray) {
    legalSquares = [];
    moveToEightRank(startingSquareId, pieceColor, boardSquaresArray);
    moveToFirstRank(startingSquareId, pieceColor, boardSquaresArray);
    moveToAFile(startingSquareId, pieceColor, boardSquaresArray);
    moveToHFile(startingSquareId, pieceColor, boardSquaresArray);
}

function moveToEightRank(startingSquareId, pieceColor, boardSquaresArray) {
    const file = startingSquareId.charAt(0);
    let rank = parseInt(startingSquareId.charAt(1));
    while (rank < 8) {
        rank++;
        const sq = boardSquaresArray.find(el => el.squareId === file + rank);
        if (!sq) return;
        if (sq.pieceColor === pieceColor) return;
        legalSquares.push(file + rank);
        if (sq.pieceColor !== "blank") return;
    }
}

function moveToFirstRank(startingSquareId, pieceColor, boardSquaresArray) {
    const file = startingSquareId.charAt(0);
    let rank = parseInt(startingSquareId.charAt(1));
    while (rank > 1) {
        rank--;
        const sq = boardSquaresArray.find(el => el.squareId === file + rank);
        if (!sq) return;
        if (sq.pieceColor === pieceColor) return;
        legalSquares.push(file + rank);
        if (sq.pieceColor !== "blank") return;
    }
}

function moveToAFile(startingSquareId, pieceColor, boardSquaresArray) {
    const rank = startingSquareId.charAt(1);
    let file = startingSquareId.charAt(0);
    while (file !== "a") {
        file = String.fromCharCode(file.charCodeAt(0) - 1);
        const sq = boardSquaresArray.find(el => el.squareId === file + rank);
        if (!sq) return;
        if (sq.pieceColor === pieceColor) return;
        legalSquares.push(file + rank);
        if (sq.pieceColor !== "blank") return;
    }
}

function moveToHFile(startingSquareId, pieceColor, boardSquaresArray) {
    const rank = startingSquareId.charAt(1);
    let file = startingSquareId.charAt(0);
    while (file !== "h") {
        file = String.fromCharCode(file.charCodeAt(0) + 1);
        const sq = boardSquaresArray.find(el => el.squareId === file + rank);
        if (!sq) return;
        if (sq.pieceColor === pieceColor) return;
        legalSquares.push(file + rank);
        if (sq.pieceColor !== "blank") return;
    }
}

function getBishopMoves(startingSquareId, pieceColor, boardSquaresArray) {
    legalSquares = [];
    moveDiagonal(startingSquareId, pieceColor, boardSquaresArray, 1, 1);
    moveDiagonal(startingSquareId, pieceColor, boardSquaresArray, 1, -1);
    moveDiagonal(startingSquareId, pieceColor, boardSquaresArray, -1, 1);
    moveDiagonal(startingSquareId, pieceColor, boardSquaresArray, -1, -1);
}

function moveDiagonal(startingSquareId, pieceColor, boardSquaresArray, fileStep, rankStep) {
    let file = startingSquareId.charCodeAt(0);
    let rank = parseInt(startingSquareId.charAt(1));
    while (true) {
        file += fileStep; rank += rankStep;
        if (file < 97 || file > 104 || rank < 1 || rank > 8) break;
        const id = String.fromCharCode(file) + rank;
        const sq = boardSquaresArray.find(el => el.squareId === id);
        if (!sq) break;
        if (sq.pieceColor === pieceColor) break;
        legalSquares.push(id);
        if (sq.pieceColor !== "blank") break;
    }
}

function getQueenMoves(startingSquareId, pieceColor, boardSquaresArray) {
    legalSquares = [];
    moveToEightRank(startingSquareId, pieceColor, boardSquaresArray);
    moveToFirstRank(startingSquareId, pieceColor, boardSquaresArray);
    moveToAFile(startingSquareId, pieceColor, boardSquaresArray);
    moveToHFile(startingSquareId, pieceColor, boardSquaresArray);
    moveDiagonal(startingSquareId, pieceColor, boardSquaresArray, 1, 1);
    moveDiagonal(startingSquareId, pieceColor, boardSquaresArray, -1, 1);
    moveDiagonal(startingSquareId, pieceColor, boardSquaresArray, 1, -1);
    moveDiagonal(startingSquareId, pieceColor, boardSquaresArray, -1, -1);
}

function getKingMoves(startingSquareId, pieceColor, boardSquaresArray) {
    legalSquares = [];
    const file = startingSquareId.charCodeAt(0) - 97;
    const rankNumber = parseInt(startingSquareId.charAt(1));
    [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([df, dr]) => {
        const f = file + df, r = rankNumber + dr;
        if (f >= 0 && f <= 7 && r >= 1 && r <= 8) {
            const id = String.fromCharCode(f + 97) + r;
            const sq = boardSquaresArray.find(el => el.squareId === id);
            if (sq && sq.pieceColor !== pieceColor) legalSquares.push(id);
        }
    });
}

function highlightSquares(squares, originSquareId) {
    const layer = document.querySelector('.highlight-layer');
    layer.innerHTML = '';
    for (const id of squares) {
        const square = document.getElementById(id);
        const rect = square.getBoundingClientRect();
        const boardRect = layer.getBoundingClientRect();
        const highlight = document.createElement('div');
        highlight.classList.add('highlight');
        highlight.style.left = `${rect.left - boardRect.left}px`;
        highlight.style.top = `${rect.top - boardRect.top}px`;
        highlight.style.width = `${rect.width}px`;
        highlight.style.height = `${rect.height}px`;
        layer.appendChild(highlight);
    }
    if (originSquareId) {
        const originSquare = document.getElementById(originSquareId);
        if (originSquare) {
            const rect = originSquare.getBoundingClientRect();
            const boardRect = layer.getBoundingClientRect();
            const originHighlight = document.createElement('div');
            originHighlight.classList.add('highlight-origin');
            originHighlight.style.left = `${rect.left - boardRect.left}px`;
            originHighlight.style.top = `${rect.top - boardRect.top}px`;
            originHighlight.style.width = `${rect.width}px`;
            originHighlight.style.height = `${rect.height}px`;
            layer.appendChild(originHighlight);
        }
    }
}

// ── Check detection ──────────────────────────────────────────────

function simulateMove(fromId, toId, boardSquaresArray) {
    const newBoard = boardSquaresArray.map(el => ({ ...el }));
    const from = newBoard.find(el => el.squareId === fromId);
    const to = newBoard.find(el => el.squareId === toId);
    to.pieceColor = from.pieceColor;
    to.pieceType = from.pieceType;
    to.pieceId = from.pieceId;
    from.pieceColor = "blank";
    from.pieceType = "blank";
    from.pieceId = "blank";
    return newBoard;
}

function isKingInCheck(pieceColor, boardSquaresArray) {
    const kingSquare = boardSquaresArray.find(
        el => el.pieceType === "king" && el.pieceColor === pieceColor
    );
    if (!kingSquare) return false;
    const kingSquareId = kingSquare.squareId;
    const opponentColor = pieceColor === "white" ? "black" : "white";
    for (const square of boardSquaresArray) {
        if (square.pieceColor !== opponentColor) continue;
        const attacks = getAttackSquaresClean(square.squareId, square.pieceType, opponentColor, boardSquaresArray);
        if (attacks.includes(kingSquareId)) return true;
    }
    return false;
}

function getAttackSquaresClean(squareId, pieceType, pieceColor, boardSquaresArray) {
    if (pieceType === "pawn") return getPawnAttackSquares(squareId, pieceColor);
    let squares = [];
    if (pieceType === "knight") {
        const file = squareId.charCodeAt(0) - 97;
        const rank = parseInt(squareId.charAt(1));
        [[-2,1],[-1,2],[1,2],[2,1],[2,-1],[1,-2],[-1,-2],[-2,-1]].forEach(([df, dr]) => {
            const f = file + df, r = rank + dr;
            if (f >= 0 && f <= 7 && r >= 1 && r <= 8) {
                const id = String.fromCharCode(f + 97) + r;
                const sq = boardSquaresArray.find(el => el.squareId === id);
                if (sq && sq.pieceColor !== pieceColor) squares.push(id);
            }
        });
    }
    if (pieceType === "rook" || pieceType === "queen")
        squares = squares.concat(getSlidingMoves(squareId, pieceColor, boardSquaresArray, [[1,0],[-1,0],[0,1],[0,-1]]));
    if (pieceType === "bishop" || pieceType === "queen")
        squares = squares.concat(getSlidingMoves(squareId, pieceColor, boardSquaresArray, [[1,1],[1,-1],[-1,1],[-1,-1]]));
    if (pieceType === "king") {
        const file = squareId.charCodeAt(0) - 97;
        const rank = parseInt(squareId.charAt(1));
        [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([df, dr]) => {
            const f = file + df, r = rank + dr;
            if (f >= 0 && f <= 7 && r >= 1 && r <= 8) {
                const id = String.fromCharCode(f + 97) + r;
                const sq = boardSquaresArray.find(el => el.squareId === id);
                if (sq && sq.pieceColor !== pieceColor) squares.push(id);
            }
        });
    }
    return squares;
}

function getSlidingMoves(squareId, pieceColor, boardSquaresArray, directions) {
    const squares = [];
    const file = squareId.charCodeAt(0);
    const rank = parseInt(squareId.charAt(1));
    for (const [df, dr] of directions) {
        let f = file, r = rank;
        while (true) {
            f += df; r += dr;
            if (f < 97 || f > 104 || r < 1 || r > 8) break;
            const id = String.fromCharCode(f) + r;
            const sq = boardSquaresArray.find(el => el.squareId === id);
            if (!sq) break;
            if (sq.pieceColor === pieceColor) break;
            squares.push(id);
            if (sq.pieceColor !== "blank") break;
        }
    }
    return squares;
}

function getPawnAttackSquares(squareId, pieceColor) {
    const file = squareId.charAt(0);
    const rank = parseInt(squareId.charAt(1));
    const direction = pieceColor === "white" ? 1 : -1;
    const attackRank = rank + direction;
    const squares = [];
    for (let i = -1; i <= 1; i += 2) {
        const attackFile = String.fromCharCode(file.charCodeAt(0) + i);
        if (attackFile >= "a" && attackFile <= "h") squares.push(attackFile + attackRank);
    }
    return squares;
}

function filterMovesForCheck(fromId, pieceColor) {
    legalSquares = legalSquares.filter(toId => {
        const simBoard = simulateMove(fromId, toId, boardSquaresArray);
        return !isKingInCheck(pieceColor, simBoard);
    });
}

// ── Checkmate & Stalemate ────────────────────────────────────────

function hasNoLegalMoves(pieceColor, boardSquaresArray) {
    for (const square of boardSquaresArray) {
        if (square.pieceColor !== pieceColor) continue;

        const tempPiece = {
            getAttribute: () => pieceColor,
            classList: { contains: (type) => square.pieceType === type }
        };

        const backup = legalSquares;
        legalSquares = [];

        getPossibleMoves(square.squareId, tempPiece, boardSquaresArray);

        const pieceMoves = legalSquares.filter(toId => {
            const simBoard = simulateMove(square.squareId, toId, boardSquaresArray);
            return !isKingInCheck(pieceColor, simBoard);
        });

        legalSquares = backup;

        if (pieceMoves.length > 0) return false;
    }
    return true;
}

function isCheckmate(pieceColor, boardSquaresArray) {
    return isKingInCheck(pieceColor, boardSquaresArray) && hasNoLegalMoves(pieceColor, boardSquaresArray);
}

function isStalemate(pieceColor, boardSquaresArray) {
    return !isKingInCheck(pieceColor, boardSquaresArray) && hasNoLegalMoves(pieceColor, boardSquaresArray);
}

// ── Notifications & Modal ────────────────────────────────────────

function showCheckNotification(pieceColor) {
    const existing = document.querySelector('.check-notification');
    if (existing) existing.remove();
    const notification = document.createElement('div');
    notification.classList.add('check-notification');
    notification.textContent = `${pieceColor === "white" ? "White" : "Black"} King is in Check!`;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 500);
    }, 2000);
}

function showGameOverModal(title, message) {
    const allPieces = document.getElementsByClassName("piece");
    for (let i = 0; i < allPieces.length; i++) {
        allPieces[i].setAttribute("draggable", false);
    }
    const overlay = document.createElement('div');
    overlay.classList.add('modal-overlay');
    overlay.innerHTML = `
        <div class="modal">
            <h2>${title}</h2>
            <p>${message}</p>
            <button onclick="restartGame()">Play Again</button>
        </div>
    `;
    document.body.appendChild(overlay);
}

function restartGame() {
    location.reload();
}