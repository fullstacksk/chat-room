const users = []
//addUser, removeUser, getUser, getUsersList

const addUser = ({
    id,
    username,
    chatroom
}) => {
    username = username.trim().toLowerCase()
    chatroom = chatroom.trim().toLowerCase()

    //validate user
    if (!username || !chatroom) {
        return {
            error: "All fields are requirred!"
        }
    }

    //check for existing user
    const existingUser = users.find((user) => {
        return user.chatroom === chatroom && user.username === username
    })

    //validate username
    if (existingUser) {
        return {
            error: "Usename is in use"
        }
    }

    //store user
    const user = {
        id,
        username,
        chatroom
    }
    users.push(user)
    return {
        user
    }
}

//removeUser
const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })
    if (index !== -1) {
        //users.splice(index, 1) returns an array
        return users.splice(index, 1)[0]
    }
}

//getUser
const getUser = (id) => {
    const user = users.find((user) => user.id === id)
    if (!user) {
        return {
            error: "User doesn't exist with this credential!"
        }
    }
    return {
        user
    }
}
//getUsersInRoom
const getUsersInRoom = (chatroom) => {
    const usersInRoom = users.filter((user) => user.chatroom === chatroom)
    if (usersInRoom.length === 0) {
        return {
            error: "Not a single user exists!"
        }
    }
    return usersInRoom
}


// addUser({
//     username: 'sahil',
//     chatroom: 'js'
// })
// const options = {
//     username: 'sahil',
//     chatroom: 'js'
// }
// const {
//     user,
//     error
// } = addUser({
//     id: 1,
//     ...options
// })
// console.log(user, error)


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}