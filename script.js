let boardSquaresArray =[];
let legalSquares=[];
let isWhiteTurn = true;
const boardSquares=document.getElementsByClassName("square") //array contain all object with class name square
const pieces=document.getElementsByClassName("piece");
const piecesImages=document.getElementsByTagName("img");
setupBoardSquares();
setupPieces();
fillBoardSquaresArray();
function fillBoardSquaresArray(){
    const boardSquares = document.getElementsByClassName("square");
    for (let i = 0;i<boardSquares.length;i++){
        let row = 8 - Math.floor(i/8);
        let column= String.fromCharCode(97+(i%8));
        let square = boardSquares[i];
        square.id=column+row;
        let color="";
        let pieceType="";
        let pieceId="";
        if(square.querySelector(".piece")){
            color=square.querySelector(".piece").getAttribute("color");
            pieceType=square.querySelector(".piece").classList[1];
            pieceId=square.querySelector(".piece").id;
        }
        else{
            color = "blank";
            pieceType="blank";
            pieceId="blank";
        }
        let arrayElement={
            squareId:square.id,
            pieceColor:color,
            pieceType:pieceType,
            pieceId:pieceId
        };
        boardSquaresArray.push(arrayElement);
    }
}

function setupBoardSquares(){
    for (let i=0; i<boardSquares.length;i++){
        boardSquares[i].addEventListener("dragover",allowDrop);
        boardSquares[i].addEventListener("drop",drop);
        let row = 8-Math.floor(i/8);
        let column = String.fromCharCode(97+(i%8));
        let square=boardSquares[i];
        square.id=column+row;
    }
}
function setupPieces(){
    for(let i=0; i<pieces.length;i++){
        pieces[i].addEventListener("dragstart",drag);
        pieces[i].setAttribute("draggable",true);
        pieces[i].id=pieces[i].className.split(" ")[1]+pieces[i].parentElement.id;
    }
    for(let i=0; i<piecesImages.length;i++){
        piecesImages[i].setAttribute("draggable",false);
    }
}
// Drag and drop function
function allowDrop(ev){
    ev.preventDefault();
}
function drag(ev){
    boardSquaresArray = [];
    fillBoardSquaresArray();
    const piece = ev.target;
    const pieceColor = piece.getAttribute("color");

    if ((isWhiteTurn && pieceColor == "white") || (!isWhiteTurn && pieceColor == "black")) {
        ev.dataTransfer.setData("text", piece.id);
        const startingSquareId = piece.parentNode.id;
        getPossibleMoves(startingSquareId, piece,boardSquaresArray);

        // Xoá highlight cũ (nếu có)
        const layer = document.querySelector('.highlight-layer');
        if (layer) layer.innerHTML = '';

        // Gọi highlight mới
        highlightSquares(legalSquares, startingSquareId);
    }
}

function drop(ev) {
    ev.preventDefault();
    let data = ev.dataTransfer.getData("text");
    const piece = document.getElementById(data);
    const destinationSquare = ev.currentTarget;
    let destinationSquareId = destinationSquare.id;

    // 🔹 Xoá highlight overlay
    const layer = document.querySelector('.highlight-layer');
    if (layer) layer.innerHTML = '';

    // 🔹 Nếu ô hợp lệ
    if (legalSquares.includes(destinationSquareId)) {
        // Nếu có quân ở đó thì xoá (ăn quân)
        while (destinationSquare.firstChild) {
            destinationSquare.removeChild(destinationSquare.firstChild);
        }

        // Di chuyển quân
        destinationSquare.appendChild(piece);

        // Đổi lượt
        isWhiteTurn = !isWhiteTurn;

        // Reset danh sách ô hợp lệ
        legalSquares.length = 0;
    }
}

// Possible moves
function getPossibleMoves(startingSquareId,piece,boardSquaresArray){
    const pieceColor=piece.getAttribute("color");
    if(piece.classList.contains("pawn")){
        getPawnMoves(startingSquareId,pieceColor,boardSquaresArray);
    }
    if(piece.classList.contains("knight")){
        getKnightMoves(startingSquareId,pieceColor,boardSquaresArray);
    }
    if(piece.classList.contains("rook")){
        getRookMoves(startingSquareId,pieceColor,boardSquaresArray);
    }
    if(piece.classList.contains("bishop")){
        getBishopMoves(startingSquareId,pieceColor,boardSquaresArray);
    }
    if(piece.classList.contains("queen")){
        getQueenMoves(startingSquareId,pieceColor,boardSquaresArray);
    }
    if(piece.classList.contains("king")){
        getKingMoves(startingSquareId,pieceColor,boardSquaresArray);
    }
}
// Capture function
function getPieceAtSquare(squareId,boardSquaresArray){
    let currentSquare = boardSquaresArray.find((element)=>element.squareId == squareId);
    const color=currentSquare.pieceColor;
    const pieceType=currentSquare.pieceType;
    const pieceId=currentSquare.pieceId;
    return{pieceColor:color, pieceType:pieceType,piecesId:pieceId};
}
function getPawnMoves(startingSquareId, pieceColor,boardSquaresArray){
    const captures= checkPawnDiagonalCaptures(startingSquareId,pieceColor,boardSquaresArray);
    const forwards= checkPawnForwardMoves(startingSquareId,pieceColor,boardSquaresArray);
    legalSquares = forwards.concat(captures);
}
function checkPawnDiagonalCaptures(startingSquareId,pieceColor,boardSquaresArray){
    const file=startingSquareId.charAt(0);
    const rank=startingSquareId.charAt(1);
    const rankNumber=parseInt(rank);
    let currentFile=file;
    let currentRank =rankNumber;
    let currentSquareId=currentFile+currentRank;
    let legalSquares=[];
    const direction=pieceColor=="white" ? 1:-1;
    currentRank += direction;
    for(let i = -1; i<=1 ;i+=2){
        currentFile=String.fromCharCode(file.charCodeAt(0)+i);
        if(currentFile>="a" && currentFile<="h"){
            currentSquareId = currentFile + currentRank;
            let currentSquare = boardSquaresArray.find((element)=>element.squareId == currentSquareId);
            const squareContent=currentSquare.pieceColor;
            if(squareContent != "blank" && squareContent != pieceColor)
                legalSquares.push(currentSquareId);
        }
    }
    return legalSquares;
}
function checkPawnForwardMoves(startingSquareId, pieceColor, boardSquaresArray) {
    const file = startingSquareId.charAt(0);
    const rankNumber = parseInt(startingSquareId.charAt(1));
    let legalSquares = [];
    const direction = pieceColor === "white" ? 1 : -1;

    // forward 1 ô
    let currentRank = rankNumber + direction;
    let currentSquareId = file + currentRank;
    let currentSquare = boardSquaresArray.find(el => el.squareId === currentSquareId);
    let squareContent = currentSquare?.pieceColor || "blank";
    if (squareContent !== "blank") return legalSquares;

    legalSquares.push(currentSquareId);

    // forward 2 ô, chỉ nếu ở rank start
    if ((pieceColor === "white" && rankNumber === 2) || (pieceColor === "black" && rankNumber === 7)) {
        currentRank += direction;
        currentSquareId = file + currentRank;
        currentSquare = boardSquaresArray.find(el => el.squareId === currentSquareId);
        squareContent = currentSquare?.pieceColor || "blank";
        if (squareContent === "blank") legalSquares.push(currentSquareId);
    }

    return legalSquares;
}


// function getKnightMoves(startingSquareId,pieceColor,boardSquaresArray){
//     const file = startingSquareId.charCodeAt(0)-97;
//     const rank = startingSquareId.charAt(1);
//     const rankNumber = parseInt(rank);
//     let currentFile=file;
//     let currentRank=rankNumber;
//     let legalSquares =[];
//     const moves =[
//         [-2,1],[-1,2],[1,2],[2,1],[2,-1],[1,-2],[-1,-2],[-2,-1]
//     ];
//     moves.forEach(move=>{
//         currentFile=file+move[0];
//         currentRank=rankNumber+move[1];
//         if (currentFile>=0 && currentFile<=7 && currentRank>0 && currentRank<=8)
//         {
//             let currentSquareId = String.fromCharCode(currentFile+97)+currentRank;
//             let currentSquare = boardSquaresArray.find((element)=>element.squareId == currentSquareId);
//             let squareContent=currentSquare.pieceColor;
//             if (squareContent != "blank" && squareContent == pieceColor){ 
//                 return legalSquares;
//             }
//             legalSquares.push(String.fromCharCode(currentFile+97)+currentRank);
//         }
//     });
//     return legalSquares;
// }
function getKnightMoves(startingSquareId, pieceColor, boardSquaresArray) {
    const file = startingSquareId.charCodeAt(0) - 97;
    const rankNumber = parseInt(startingSquareId.charAt(1));
    const moves = [
        [-2, 1], [-1, 2], [1, 2], [2, 1],
        [2, -1], [1, -2], [-1, -2], [-2, -1]
    ];

    // reset legalSquares trước khi push mới
    legalSquares = [];

    moves.forEach(move => {
        const currentFile = file + move[0];
        const currentRank = rankNumber + move[1];

        if (currentFile >= 0 && currentFile <= 7 && currentRank > 0 && currentRank <= 8) {
            const currentSquareId = String.fromCharCode(currentFile + 97) + currentRank;
            const currentSquare = boardSquaresArray.find(el => el.squareId === currentSquareId);

            if (!currentSquare) return;
            const squareContent = currentSquare.pieceColor;

            // chỉ thêm nếu ô trống hoặc là quân đối thủ
            if (squareContent === "blank" || squareContent !== pieceColor) {
                legalSquares.push(currentSquareId);
            }
        }
    });
}

function getRookMoves(startingSquareId,pieceColor,boardSquaresArray){
    legalSquares=[];
    moveToEightRank(startingSquareId,pieceColor,boardSquaresArray);
    moveToFirstRank(startingSquareId,pieceColor,boardSquaresArray);
    moveToAFile(startingSquareId,pieceColor,boardSquaresArray);
    moveToHFile(startingSquareId,pieceColor,boardSquaresArray);
    return legalSquares;
}

// function moveToEightRank(startingSquareId,pieceColor,boardSquaresArray){
//     const file = startingSquareId.charAt(0);
//     const rank = startingSquareId.charAt(1);
//     const rankNumber = parseInt(rank);
//     let currentRank = rankNumber;
//     while(currentRank != 8){
//         currentRank++;
//         let currentSquareId=file+currentRank;
//         let currentSquare=document.getElementById(currentSquareId);
//         let squareContent=isSquareOccupied(currentSquare);
//         if(squareContent != "blank" && squareContent == pieceColor){
//             return;
//         }
//         legalSquares.push(currentSquareId);
//         if(squareContent!="blank" && squareContent!=pieceColor){
//             return;
//         }
//     }
//     return;
// }
function moveToEightRank(startingSquareId, pieceColor, boardSquaresArray) {
    const file = startingSquareId.charAt(0);
    const rankNumber = parseInt(startingSquareId.charAt(1));
    let currentRank = rankNumber;

    while (currentRank < 8) {
        currentRank++;
        const currentSquareId = file + currentRank;

        const currentSquare = boardSquaresArray.find(el => el.squareId === currentSquareId);
        if (!currentSquare) return;

        const squareContent = currentSquare.pieceColor;

        if (squareContent !== "blank" && squareContent === pieceColor) return;

        legalSquares.push(currentSquareId);

        if (squareContent !== "blank" && squareContent !== pieceColor) return;
    }
}

// function moveToFirstRank(startingSquareId,pieceColor,boardSquaresArray){
//     const file = startingSquareId.charAt(0);
//     const rank = startingSquareId.charAt(1);
//     const rankNumber = parseInt(rank);
//     let currentRank = rankNumber;
//     while(currentRank != 1){
//         currentRank--;
//         let currentSquareId=file+currentRank;
//         let currentSquare=document.getElementById(currentSquareId);
//         let squareContent=isSquareOccupied(currentSquare);
//         if(squareContent != "blank" && squareContent == pieceColor){
//             return;
//         }
//         legalSquares.push(currentSquareId);
//         if(squareContent!="blank" && squareContent!=pieceColor){
//             return;
//         }
//     }
//     return;
// }
function moveToFirstRank(startingSquareId, pieceColor, boardSquaresArray) {
    const file = startingSquareId.charAt(0);
    const rankNumber = parseInt(startingSquareId.charAt(1));
    let currentRank = rankNumber;

    while (currentRank > 1) {
        currentRank--;
        const currentSquareId = file + currentRank;

        const currentSquare = boardSquaresArray.find(el => el.squareId === currentSquareId);
        if (!currentSquare) return;

        const squareContent = currentSquare.pieceColor;

        if (squareContent !== "blank" && squareContent === pieceColor) return;

        legalSquares.push(currentSquareId);

        if (squareContent !== "blank" && squareContent !== pieceColor) return;
    }
}

// function moveToAFile(startingSquareId,pieceColor,boardSquaresArray){
//     const file = startingSquareId.charAt(0);
//     const rank = startingSquareId.charAt(1);
//     const rankNumber = parseInt(rank);
//     let currentFile = file;
//     while(currentFile != "a"){
//         currentFile=String.fromCharCode(currentFile.charCodeAt(0) - 1);
//         let currentSquareId= currentFile+rank;
//         let currentSquare=document.getElementById(currentSquareId);
//         let squareContent=isSquareOccupied(currentSquare);
//         if(squareContent != "blank" && squareContent == pieceColor){
//             return;
//         }
//         legalSquares.push(currentSquareId);
//         if(squareContent!="blank" && squareContent!=pieceColor){
//             return;
//         }
//     }
//     return;
// }
function moveToAFile(startingSquareId, pieceColor, boardSquaresArray) {
    const rank = startingSquareId.charAt(1);
    let currentFile = startingSquareId.charAt(0);

    while (currentFile !== "a") {
        currentFile = String.fromCharCode(currentFile.charCodeAt(0) - 1);
        const currentSquareId = currentFile + rank;

        const currentSquare = boardSquaresArray.find(el => el.squareId === currentSquareId);
        if (!currentSquare) return;

        const squareContent = currentSquare.pieceColor;

        if (squareContent !== "blank" && squareContent === pieceColor) return;

        legalSquares.push(currentSquareId);

        if (squareContent !== "blank" && squareContent !== pieceColor) return;
    }
}

// function moveToHFile(startingSquareId,pieceColor,boardSquaresArray){
//     const file = startingSquareId.charAt(0);
//     const rank = startingSquareId.charAt(1);
//     const rankNumber = parseInt(rank);
//     let currentFile = file;
//     while(currentFile != "h"){
//         currentFile=String.fromCharCode(currentFile.charCodeAt(0) + 1);
//         let currentSquareId= currentFile+rank;
//         let currentSquare=document.getElementById(currentSquareId);
//         let squareContent=isSquareOccupied(currentSquare);
//         if(squareContent != "blank" && squareContent == pieceColor){
//             return;
//         }
//         legalSquares.push(currentSquareId);
//         if(squareContent!="blank" && squareContent!=pieceColor){
//             return;
//         }
//     }
//     return;
// }
function moveToHFile(startingSquareId, pieceColor, boardSquaresArray) {
    const rank = startingSquareId.charAt(1);
    let currentFile = startingSquareId.charAt(0);

    while (currentFile !== "h") {
        currentFile = String.fromCharCode(currentFile.charCodeAt(0) + 1);
        const currentSquareId = currentFile + rank;

        const currentSquare = boardSquaresArray.find(el => el.squareId === currentSquareId);
        if (!currentSquare) return;

        const squareContent = currentSquare.pieceColor;

        if (squareContent !== "blank" && squareContent === pieceColor) return;

        legalSquares.push(currentSquareId);

        if (squareContent !== "blank" && squareContent !== pieceColor) return;
    }
}

function getBishopMoves(startingSquareId, pieceColor, boardSquaresArray) {
    legalSquares = [];

    moveDiagonal(startingSquareId, pieceColor, boardSquaresArray, 1, 1);   // Hướng: H+R+
    moveDiagonal(startingSquareId, pieceColor, boardSquaresArray, 1, -1);  // H+R-
    moveDiagonal(startingSquareId, pieceColor, boardSquaresArray, -1, 1);  // A+R+
    moveDiagonal(startingSquareId, pieceColor, boardSquaresArray, -1, -1); // A+R-

    return legalSquares;
}

function moveDiagonal(startingSquareId, pieceColor, boardSquaresArray, fileStep, rankStep) {
    let file = startingSquareId.charCodeAt(0);  // ký tự file
    let rank = parseInt(startingSquareId.charAt(1));

    while (true) {
        file += fileStep;
        rank += rankStep;

        if (file < 97 || file > 104 || rank < 1 || rank > 8) break; // ngoài bàn

        const squareId = String.fromCharCode(file) + rank;
        const square = boardSquaresArray.find(el => el.squareId === squareId);
        const squareContent = square?.pieceColor || "blank";

        if (squareContent !== "blank" && squareContent === pieceColor) break;

        legalSquares.push(squareId);

        if (squareContent !== "blank" && squareContent !== pieceColor) break;
    }
}

function getQueenMoves(startingSquareId, pieceColor, boardSquaresArray){
    legalSquares = [];

    // các đường thẳng (Rook)
    moveToEightRank(startingSquareId, pieceColor, boardSquaresArray);
    moveToFirstRank(startingSquareId, pieceColor, boardSquaresArray);
    moveToAFile(startingSquareId, pieceColor, boardSquaresArray);
    moveToHFile(startingSquareId, pieceColor, boardSquaresArray);

    // các đường chéo (Bishop)
    moveDiagonal(startingSquareId, pieceColor, boardSquaresArray, 1, 1);   // lên H rank
    moveDiagonal(startingSquareId, pieceColor, boardSquaresArray, -1, 1);  // lên A rank
    moveDiagonal(startingSquareId, pieceColor, boardSquaresArray, 1, -1);  // xuống H rank
    moveDiagonal(startingSquareId, pieceColor, boardSquaresArray, -1, -1); // xuống A rank

    return legalSquares;
}

function getKingMoves(startingSquareId, pieceColor, boardSquaresArray){
    legalSquares = [];

    const file = startingSquareId.charCodeAt(0) - 97;
    const rankNumber = parseInt(startingSquareId.charAt(1));

    const moves = [
        [0, 1], [0, -1], [1, 1], [1, -1],
        [-1, 0], [-1, -1], [-1, 1], [1, 0]
    ];

    moves.forEach(move => {
        const currentFile = file + move[0];
        const currentRank = rankNumber + move[1];

        if (currentFile >= 0 && currentFile <= 7 && currentRank >= 1 && currentRank <= 8){
            const currentSquareId = String.fromCharCode(currentFile + 97) + currentRank;
            const currentSquare = boardSquaresArray.find(el => el.squareId === currentSquareId);
            const squareContent = currentSquare?.pieceColor || "blank";

            if (squareContent !== pieceColor){
                legalSquares.push(currentSquareId);
            }
        }
    });

    return legalSquares;
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
