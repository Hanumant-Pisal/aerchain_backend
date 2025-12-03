const express = require('express');
require('dotenv').config();
require('./Config/database')
const app = express();
const port  = process.env.PORT;




app.get("/test", (req,resp)=>{
    resp.send("api is working")
})




app.listen(port, ()=>{
    console.log(`server started at port ${port}`);
    
})