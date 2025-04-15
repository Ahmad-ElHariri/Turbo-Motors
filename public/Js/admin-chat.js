const socket = io();
const chatForm = document.getElementById("chat-form");
const chatBox = document.getElementById("chat-box");
const userList = document.getElementById("user-list");
const messageInput = document.getElementById("messageInput");

const adminName = document.getElementById("adminName").value;
socket.emit("joinRoom", adminName);


socket.on("userList", (users) => {
    userList.innerHTML = "";
    users.forEach((user) => {
        const li = document.createElement("li");
        li.textContent = user;
        li.classList.add("user-item");
        li.onclick = () => {
            chatBox.setAttribute("data-current-room", user);
            socket.emit("switchRoom", user);
            chatBox.innerHTML = ""; 
            socket.emit("requestHistory", user);
        };
        userList.appendChild(li);
    });
});

chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = messageInput.value;
    const currentRoom = chatBox.getAttribute("data-current-room");

    if (currentRoom) {
        socket.emit("chatMessage", { roomId: currentRoom, text: msg });
        messageInput.value = "";
        messageInput.focus();
    } else {
        alert("Please select a user to chat with.");
    }
});

socket.on("message", (message) => {
    const colonIndex = message.indexOf(": ");
    if (colonIndex !== -1) {
        const sender = message.substring(0, colonIndex);
        const text = message.substring(colonIndex + 2);

        const isSelf = sender === adminName;
        const className = isSelf ? "right" : "left";

        displayMessage(sender, text, className);
    } else {
        displayMessage("System", message, "left");
    }
});
socket.on("previousMessages", ({ room, messages }) => {
    if (chatBox.getAttribute("data-current-room") === room) {
      chatBox.innerHTML = "";
      messages.forEach((msg) => {
        const colonIndex = msg.indexOf(": ");
        if (colonIndex !== -1) {
          const sender = msg.substring(0, colonIndex);
          const text = msg.substring(colonIndex + 2);
          const className = sender === adminName ? "right" : "left";
          displayMessage(sender, text, className);
        }
      });
    }
  });
  


function displayMessage(sender, message, className) {
    const displayName = sender === adminName ? "You" : sender;
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", className);
    messageDiv.textContent = `${displayName}: ${message}`;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}
