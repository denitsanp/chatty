document.addEventListener('DOMContentLoaded', () => {
  const socket = io();
  
  const messageForm = document.getElementById('message-form');
  const messageInput = document.getElementById('message-input');
  const messagesContainer = document.getElementById('messages-container');

  const params = new URLSearchParams(window.location.search);
  const uuid = params.get('uuid');

  socket.on('chat message', (data) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('mb-2', 'rounded-pill', 'p-2', 'w-25');

    if (data.username === 'System') {
      messageElement.classList.add('text-secondary', 'm-auto'); 
      messageElement.textContent = `${data.msg}`; 
      if (data.uuid === uuid) {
        messageElement.classList.add('bg-primary', 'text-white', 'float-end');
      }
    } else {
      messageElement.classList.add('bg-primary', 'text-white');
      messageElement.textContent = `${data.username}: ${data.msg}`;
    }

    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight; 
  });

  messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value;
    socket.emit('chat message', message); 
    messageInput.value = ''; 
  });

  if (uuid) {
    socket.emit('new user', uuid);
  } else {
    console.error('UUID not provided');
  }
});

