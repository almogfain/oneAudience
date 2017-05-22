var player = 1;
var mooves = [];
var board = [];
var isGameOn = true;

function initGame(){
    document.getElementById("restart").addEventListener("click", startNewGame);
	var cells = document.querySelectorAll("td div");

	for(var i = 0; i < cells.length ;i++)
	{
		cells[i].addEventListener("click", cellClicked(i + 1));
	}
}

function isMoveValid(cellNum)
{
    return board[cellNum - 1] === undefined;
}

function cellClicked (cellNum){
    return function(){
        if(isGameOn)
        {
            if(isMoveValid(cellNum))
            {
                mooves.push(cellNum);
                board[cellNum - 1] = player;

                var pic = player == 1 ? "X.png" : "O.png";

                document.getElementById("img" + cellNum).setAttribute("src", pic);

                if(isGmeFinished() == -1)
                   changePlayer();
                else
                {
                    finishGame();
                }
                
                console.log(board);
                console.log(mooves);
            }
        }
    }
}

function isGmeFinished()
{
	if((board[0] == player && board[1] == player && board[2] == player) ||
		(board[3] == player && board[4] == player && board[5] == player) ||
		(board[6] == player && board[7] == player && board[8] == player) ||
		(board[0] == player && board[3] == player && board[6] == player) ||
		(board[1] == player && board[4] == player && board[7] == player) ||
		(board[2] == player && board[5] == player && board[8] == player) ||
		(board[0] == player && board[4] == player && board[8] == player) ||
		(board[2] == player && board[4] == player && board[6] == player))
		return player;
	else
		return -1;
}

function startNewGame(){
	mooves = [];
	board = [];
	isGameOn = true;
    player = 1;
    
    document.querySelector("#p" + player).classList.remove("winner");
    document.querySelector("#p1").classList.remove("active");
    document.querySelector("#p2").classList.remove("active");
    document.querySelector("#p1").classList.add("active");
    
	var imgs = document.getElementsByTagName("img");

	for(var i = 0; i < imgs.length ;i++)
	{
		imgs[i].removeAttribute("src");
	}
}

function finishGame(){
	isGameOn = false;
	document.querySelector("#p1").classList.remove("active");
    document.querySelector("#p2").classList.remove("active");
    document.querySelector("#p" + player).classList.add("winner");
    
    // Send a post request to the server in order to save the game result
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    fetch("/game/endGame", {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify({player1Id: document.querySelector("#p1").getAttribute("name"), player2Id: document.querySelector("#p2").getAttribute("name"), gameMooves: mooves, winner: document.querySelector("#p" + player).getAttribute("name")})
    });
}

function changePlayer(){
    player = player == 1 ? 2 : 1;
    document.querySelector("#p1").classList.toggle("active");
    document.querySelector("#p2").classList.toggle("active");    
}

initGame();
startNewGame();