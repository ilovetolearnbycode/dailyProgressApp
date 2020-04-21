const express = require("express");
const app = express();
const PORT = process.env.PORT||3000;
const cors = require("cors");
const DataStore = require('nedb');
const db = new DataStore({filename:"./database.json"});
db.loadDatabase();


app.listen(PORT,()=>console.log("Running on the port : ",PORT));

app.use(cors());
app.use(express.json());
app.use(express.static("public"));


app.get("/",(req,res)=>{
	res.send("this is the home page!");
});

// insert into database!
app.post("/addSubject",(req,res)=>{
	db.insert(req.body,(err,newDoc)=>{
		if(!err){
			res.send(newDoc);
		}else{
			res.sendStatus(500);
			return;
		}
	});
});


// list all the records and send it back to client!
app.get('/getAllData',(req,res)=>{
	db.find({},(err,docs)=>{
		if(!err){
			res.send(docs);
		}else{
			res.sendStatus(500);
			return;
		}
	});
});


// deleting a record!
app.post("/deleteRecord",(req,res)=>{
	db.remove({_id:req.body.id},(err,numRemoved)=>{
		if(!err){
			res.sendStatus(200);
		}else{
			res.sendStatus(500);
			return;
		}
	});
});


// updating records

app.post('/updateRecord',(req,res)=>{
	db.update({_id:req.body.id},{$set:{start:req.body.data}},(err,numReplaced)=>{
		if(!err){
			res.sendStatus(200);
		}else{
			res.sendStatus(500);
			return;
		}
	});
});


