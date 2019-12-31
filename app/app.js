const path = require('path')
const http = require('http')
const fs = require('fs')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')
const ejs = require('ejs')
const {
    generateMessage
} = require('./utils/message')
const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
} = require('./utils/user')

const app = express()

const port = process.env.PORT || 3000
//setting up static directory (PUBLIC) to serve
const publicDirPath = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, '../views')
app.use(express.static(publicDirPath))


//setup handlebar engine and views location
app.set("view engine", "ejs")
app.set("views", viewsPath) //By default its paths is setted to '../views' as folder name
// hbs.registerPartials(partialPaths)
app.use(cookieParser())
app.use(session({
    secret: 'secret123',
    saveUninitialized: true,
    resave: true
}))
app.use(flash())
if (!session.visitors) {
    session.visitors = parseInt(fs.readFileSync('visitors.txt').toString())
    fs.writeFileSync('visitors.txt', ++(session.visitors))
    console.log(session.visitors)
} else {
    session.visitors = parseInt(fs.readFileSync('visitors.txt').toString())
    console.log(session.visitors)
}
const server = http.createServer(app)
const io = socketio(server)

// let count = 0
//server(emit) ---> client(recieve)  == countUpdated
//client(emit) ---> server(recieve)  == increment
io.on('connection', (socket) => {
    console.log('New Web-Socket Connection stablished')

    socket.on('join', (options, callback) => {
        const {
            user,
            error
        } = addUser({
            id: socket.id,
            ...options
        })
        if (error) {
            // req.flash('error', error)
            // app.locals.message = error
            return callback(error)
        }
        socket.join(user.chatroom)
        socket.emit('recieveMessage', generateMessage('Chat-Room', 'text-center', 'bg-light-primary', 'Welcome! Connected successfully!'))
        socket.broadcast.to(user.chatroom).emit('recieveMessage', generateMessage('Chat-Room', 'text-center', 'bg-light-primary', `${user.username} has joined!`))
        io.to(user.chatroom).emit('roomData', {
            chatroom: user.chatroom,
            users: getUsersInRoom(user.chatroom)
        })
        callback()
    })

    socket.on('sendMessage', (msg, callback) => {
        const filter = new Filter()
        if (filter.isProfane(msg)) {
            return callback('Profanity is not allowed')
        }
        const {
            user,
            error
        } = getUser(socket.id)
        if (error) {
            req.flash('error', error)
            req.locals.message = req.flash()
            return callback(error)
        }
        //to emit each connected connection
        socket.broadcast.to(user.chatroom).emit('recieveMessage', generateMessage(user.username, 'text-left', 'bg-light-success', msg))
        socket.emit('recieveMessage', generateMessage(user.username, 'text-right', 'bg-light-info', msg))

        callback()
    })

    socket.on('sendLocation', (location, callback) => {
        const {
            user,
            error
        } = getUser(socket.id)
        if (error) {
            return callback(error)
        }
        socket.broadcast.to(user.chatroom).emit('locationMessage', generateMessage(user.username, 'text-left', 'bg-light-blue', `https://google.com/maps?q=${location.latitude},${location.longitude}`))
        socket.emit('locationMessage', generateMessage(user.username, 'text-right', 'bg-light-info', `https://google.com/maps?q=${location.latitude},${location.longitude}`))

        callback('Location Shared!')
    })

    //connection and disconnect are the built in events
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.chatroom).emit('recieveMessage', generateMessage('Chat-Room', 'text-center', 'bg-light-primary', `${user.username} has left!`))
            io.to(user.chatroom).emit('roomData', {
                chatroom: user.chatroom,
                users: getUsersInRoom(user.chatroom)
            })
        }
    })

})
//Getting home page
app.get('', (req, res) => {
    res.render('happy-new-year-2020', {
        visitors: session.visitors
    })
})
app.get('/chat-room-login', (req, res) => {

    res.render("chat-room-login")
})

app.get('/chat-room', (req, res) => {
    res.render('chat-room')
})
app.get('/happy-new-year-2020', (req, res) => {
    res.render('happy-new-year-2020')
})
//so that it can communicate with both  server and socket.io
server.listen(port, () => {
    console.log(`Server is up on ${port}`)
})