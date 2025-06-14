const express =require('express');
const app=express();
require('dotenv').config();
const port=process.env.PORT;
const connectdb=require('./config/db')
const router=require('./routes/school')
app.use(express.json())

app.use('/api/v1',router)
app.listen(port,async()=>{
console.log(`${port} is connected `)
await connectdb;
console.log('db connected ')
})