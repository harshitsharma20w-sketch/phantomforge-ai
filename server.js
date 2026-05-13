const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(__dirname));

app.post("/generate", async (req,res)=>{

try{

const prompt = req.body.prompt;

const response = await fetch(
"https://api-inference.huggingface.co/models/gpt2",
{
method:"POST",

headers:{
Authorization:
`Bearer ${process.env.HF_TOKEN}`,
"Content-Type":"application/json"
},

body:JSON.stringify({
inputs: prompt
})

});

const data = await response.json();

res.json(data);

}catch(err){

res.status(500).json({
error: err.message
});

}

});

app.listen(3000,()=>{
console.log("PHANTOMFORGE running");
});