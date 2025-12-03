const express = require('express');
const app = express();





app.get("/test", (req,resp)=>{
    resp.send("api is working")
})




app.listen(8000, ()=>{
    console.log("server started at port 8000");
    
})