const express = require('express')
const app = express()
const cors = require('cors')
const port = 3200

app.use(express.urlencoded({
    extended: true
}))
app.use(express.json())
app.use(cors())
app.listen(port, (err)=>{
    if(err)console.log(err);
    console.log(`Aplicação rodando na porta: ${port}`)
})
