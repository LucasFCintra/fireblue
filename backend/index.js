var bodyParser = require('body-parser')
var express = require("express");
var cors = require('cors')
var app = express()
var router = require("./routes/routes")
 try{
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

// View engine
app.set('view engine','ejs');


// app.use(cors())
/*
app.use( (req,res,next) =>{
    req.header('Origin','TRUE')
    res.header("Access-Control-Allow-Origin",'http://127.0.0.1:3000'  )
    res.header("Access-Control-Allow-Origin",'localhost:3000'  )
    res.header("Access-Control-Allow-Origin","http://127.0.0.1:8687")
    res.header("Access-Control-Allow-Methods","POST",'PUT','GET','DELETE')
    app.use(cors())
    next()
})
  */

app.use(express.json())


app.use((req, res, next) => {
	//Qual site tem permissão de realizar a conexão, no exemplo abaixo está o "*" indicando que qualquer site pode fazer a conexão
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    // res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    // res.header("Access-Control-Allow-Origin", "http://127.0.0.1:3000");
	//Quais são os métodos que a conexão pode realizar na API
    res.header("Access-Control-Allow-Methods", '*');
    app.use(cors());
    next();
});


app.use("/",router);



 

app.listen(8687,'0.0.0.0',() => {
    console.log("API ON")
});


 }catch(err){
    console.log('index err?: '+ err)
 } 