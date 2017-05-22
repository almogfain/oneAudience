var express     = require("express"),
    bodyp       = require("body-parser"),
    jsonFile    = require("jsonfile"),
    override    = require("method-override"),
    app         = express();

app.set("view engine", "ejs");
app.use(bodyp.urlencoded({extended: true}));
app.use(bodyp.json());
app.use(override("_method"));
app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/client'));
app.use(express.static(__dirname + '/pics'));
app.use('/scripts', express.static(__dirname + '/node_modules/'));

var usersData = [];
var gamesData = [];
var lastId = 1;;

app.get("/", function(req, res){
    res.render("index");
});

// Management routes
app.get("/users/new", function(req, res){
    res.render("new");
});

app.get("/users/rank", function(req, res){  
    res.render("rank", {data: usersData});
});

app.get("/users/:id", function(req, res){
    res.render("show", {user: usersData.find(function(u){return u.id == req.params.id})});
});

app.delete("/users/:id", function(req, res){
    var i = usersData.findIndex(function(u){return u.id == req.params.id});
    
    if(i != -1)
    {
	   usersData.splice(i, 1);
    }

    updateUsersFile(function(){res.redirect("/users");});
});

app.get("/users", function(req, res){
    res.render("users", {users: usersData});            
});

app.post("/users", function(req, res){
    var newUser = { id: lastId, name: req.body.name, age: req.body.age, games: 0, wins: 0};
    usersData.push(newUser);
    updateUsersFile(function(){lastId++;
    res.redirect("/users");});
});

// Game routes
app.post("/game", function(req, res){
    var p1 = usersData.find(function(u){return u.name == req.body.player1Name});
    var p2 = usersData.find(function(u){return u.name == req.body.player2Name});
    res.render("game", {player1: p1, player2: p2});
});

app.delete("/games", function(req, res){
    usersData.forEach(function(user){
        user.wins = 0;
        user.games = 0;
    });
    
    gamesData = [];
    updateGamesFile(function(){ 
        updateUsersFile(function(){
            res.redirect("/users/rank");
            });
        ;});
});

// Save a finished game and update the users scores
app.post("/game/endGame", function(req, res){
    var gameRes = req.body;
    var p1 = usersData.find(function(u){return u.id == gameRes.player1Id});
    var p2 = usersData.find(function(u){return u.id == gameRes.player2Id});
    p1.games++;
    p2.games++;
    gameRes.winner == p1.id ? p1.wins++ : p2.wins++;
    gamesData.push(gameRes);
    updateGamesFile(function(){ 
        updateUsersFile(function(){ res.redirect("/");
            });
        ;});
});

// Start the server
app.listen(8080/*process.env.PORT*/, process.env.IP, function() {
    console.log("Server in running...");
    loadData();
});

function loadData(){
    jsonFile.readFile("users.json", function(err,data) {
        if(err)
            console.log(err);
        else
        {
            usersData = data;
            lastId = usersData[data.length - 1].id + 1;
        }
    });
    
    jsonFile.readFile("games.json", function(err,data) {
        if(err)
            console.log(err);
        else
        {
            gamesData = data;
        }
    });
}

function updateUsersFile(callback){
    jsonFile.writeFile("users.json", usersData, function(err){if(err) console.log(err); else callback();});
}

function updateGamesFile(callback){
    jsonFile.writeFile("games.json", gamesData, function(err){if(err) console.log(err); else callback();});
}