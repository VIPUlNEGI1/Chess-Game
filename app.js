const express = require("express")
const socket= require("socket.io")
const http = require("http")
const {Chess} = require("chess.js")
const path = require("path")

const app = express()

// socket.io
const server = http.createServer(app)
const io = socket(server)

// how to get chesss rules
const chess = new Chess()
let player  = {};
let currentplayer = "w"

app.set("view engine", "ejs") // for ejs using
app.use(express.static(path.join(__dirname,"public"))) //getting images

app.get("/",(req,res)=>{
    res.render("index",{title:"Chess Game"})
})

// thsi is for the connection
io.on("connection",function(socket){
console.log("connected")

if(!player.white){
    player.white = socket.id;
   socket.emit("playerRole","w")
}
else if(!player.black){
    player.black =socket.id;
 socket.emit("playerRole","b");
}
else{
   socket.emit("spectatorRole");
}
socket.on("disconnect",function(){
    if(socket.id === player.white){
        delete player.white;
    }else if (socket.id === player.black){
        delete player.black
    }
  })

//   this for the check the turn and wrong move
  socket.on("move",(move)=>{
    try{
        if (chess.turn() === 'w' && socket.id !== player.white) return
        if (chess.turn() === 'b' && socket.id !== player.black) return

       const result= chess.move(move)
       if(result){
        // returning the move
        currentplayer = chess.turn()
        io.emit('move',move);
        // sending the game state for all
        io.emit("boardState",chess.fen())
       }
       else{
        console.log("invalid move" , move)

        socket.emit ("invalideMove", move)
       }
    }
    catch(err){
         console.log(err)
       socket.emit("Invalid mone",move)
    }
  })
})
server.listen(3000,function(){
    console.log("server was running")
})

