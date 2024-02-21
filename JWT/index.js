const express = require('express')
const app = express()
const cors = require('cors')
const port = 3100
//token
const jwt = require('jsonwebtoken')
//crypto senha
const bcrypt = require('bcrypt')
//variáveis de ambiente
require('dotenv').config()

app.use(express.urlencoded({
    extended: true
}))
app.use(express.json())
app.use(cors())
app.listen(port, (err)=>{
    if(err)console.log(err);
    console.log(`Aplicação rodando na porta: ${port}`)
})

//checagem de token
function checkToken(req, res, next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1]

    if(!token){
        return res.status(401).json({
            'message':'Acesso negado !'
        })
    }
    try {
        const secret = jwt.sign('12h', process.env.SECRET)
        jwt.verify(token, secret)
        next()
    } catch (error) {
        console.error(error)
    }
}

let user;
app.get('/', (req, res)=>{
    res.status(200).json({
        'message':'Bem-vindo a nossa api !'
    })
})

app.post('/register', async (req, res)=>{
    const name = req.body.name
    const password = req.body.password
    const confirmPassword = req.body.confirmPassword

    if(!name){
        res.status(422).json({
            'message':'nome é obrigatório !'
        })
    }
    else if(!password){
        res.status(422).json({
            'message':'senha é obrigatório !'
        })
    }
    else if(!confirmPassword){
        res.status(422).json({
            'message':'confirmação é obrigatório !'
        })
    }
    else if(password != confirmPassword){
        res.status(422).json({
            'message':'senha e confirmação diferem !'
        })
    }
    else{
        const salt = await bcrypt.genSalt(12)
        const passwordHash = await bcrypt.hash(password, salt)
        user = {'name':name, 'password':passwordHash, 'confirmPassword':passwordHash, id: 1}
        res.status(200).json({
            'message':'conta criada !'
        })
    }
})

let userApi;
app.post('/login', async(req, res)=>{
    userApi = req.body
    console.log(user)
    console.log(userApi)
    if(user){
        const checkPassword = await bcrypt.compare(userApi.password, user.password)
        if(!userApi.name){
            res.status(422).json({
                'message':'nome é obrigatório !'
            })
        }
        else if(!userApi.password){
            res.status(422).json({
                'message':'senha é obrigatório !'
            })
        }
        else if(!userApi.confirmPassword){
            res.status(422).json({
                'message':'confirmação é obrigatório !'
            })
        }
        else if(userApi.password != userApi.confirmPassword){
            res.status(422).json({
                'message':'senha e confirmação diferem !'
            })
        }
        else if(!checkPassword){
            res.status(422).json({
                'message':'senha inválida !'
            })
        }
        else if(userApi.name !== user.name || !checkPassword){
            res.status(422).json({
                'message':'Conta não existente !'
            })
        }
        try {
            //token
            const secretKey = jwt.sign('12h', process.env.SECRET);
            const token = jwt.sign(
                {
                    id: user.id,
                },
                secretKey,
            )

            res.status(200).json({
                'message':'Autenticação realizada com sucesso !',
                'key':{
                    'token':token
                }
            })
        } catch (error) {
            console.error(error)
        }
    }
    else{
        res.status(404).json({
            'message':'Usuário não encontrado !'
        })
    }
})

//Private router
app.get('/user/:id', checkToken, async(req, res)=>{
    const id = req.params.id
    if(id !== user.id){
        res.status(404).json({
            'message':'Usuário não encontrado !'
        })
    }
    else{
        res.status(200).json({
            'user': user
        })
    }
})