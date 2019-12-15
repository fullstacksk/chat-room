const socket = io()
//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {
    username,
    chatroom
} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

const autoscroll = () => {
    //new message element
    const $newMessage = $messages.lastElementChild

    //hight of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight
    //total height of the container [ Scrollable Height]
    const containerHeight = $messages.scrollHeight
    //How far have i scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }

    // console.log(newMessageHeight)
    // console.log(newMessageMargin)
    // console.log(visibleHeight)
    // console.log(scrollOffset)
}

socket.emit('join', {
    username,
    chatroom
}, (error) => {
    if (error) {
        alert(error)
        location.href = "/"
    }
})

socket.on('recieveMessage', (msg) => {
    const html = Mustache.render(messageTemplate, {
        username: msg.username,
        message: msg.text,
        floatValue: msg.floatValue,
        bgColor: msg.bgColor,
        createdAt: moment(msg.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()

})

socket.on('locationMessage', (location) => {
    const html = Mustache.render(locationTemplate, {
        username: location.username,
        url: location.text,
        floatValue: location.floatValue,
        bgColor: location.bgColor,
        createdAt: moment(location.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({
    chatroom,
    users
}) => {
    const html = Mustache.render(sidebarTemplate, {
        chatroom,
        users
    })
    $sidebar.innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $messageFormButton.setAttribute('disabled', 'disabled')
    const msg = $messageFormInput.value
    socket.emit('sendMessage', msg, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if (error) {
            console.log(error)
        } else {
            console.log('Message Delevered!')
        }

    })
})

$sendLocationButton.addEventListener('click', () => {
    $sendLocationButton.setAttribute('disabled', 'disabled')
    if (!navigator.geolocation) {
        return alert('geoLocation is not supported by your browser')
    }
    navigator.geolocation.getCurrentPosition((position) => {
        const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }
        socket.emit('sendLocation', location, (response) => {
            console.log(response)
            // $messageFormInput.value = `https://google.com/maps?q=${location.latitude},${location.longitude}`
            // $messageFormInput.focus()
            $sendLocationButton.removeAttribute('disabled')
        })
    })

})