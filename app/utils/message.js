const generateMessage = (username, floatValue, bgColor, text) => {
    return {
        username,
        text,
        floatValue,
        bgColor,
        createdAt: new Date().getTime()
    }
}
module.exports = {
    generateMessage
}