const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const socket = io();

//Get userName and room from URL
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true});

//Join chatroom
socket.emit('joinRoom', {username, room});

//Message from server
socket.on('newMessage', (message) => {
    outputMessage(message);

    //ScorllDown to the bottom of the chat
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

//Message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    //get Message text
    const message = e.target.elements.msg.value;

    //Emit Message to server
    socket.emit('chatMessage', message);

    //Clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
})

//Output message to DOM
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">${message.text}</p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

//add room name to DOM
function outputRoomName(room) {
    roomName.innerText = room;
}

//add users to DOM
function outputUsers(users) {
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}

socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room);
    outputUsers(users);
    // const html = Mustache.render(document.getElementById('users-template').innerHTML, {
    //     users: users
    // });
    // document.querySelector('#users').innerHTML = html;
})

