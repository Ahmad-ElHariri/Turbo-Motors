const socket = io();
const chatForm = document.getElementById("chat-form");
const chatBox = document.getElementById("chat-box");
const userList = document.getElementById("user-list");
const messageInput = document.getElementById("messageInput");

socket.emit("joinRoom", "Admin");

const adminName = prompt("Enter your admin name:") || "Admin";
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
    const div = document.createElement("div");
    div.textContent = message;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
});


socket.on("previousMessages", (messages) => {
    chatBox.innerHTML = ""; 
    messages.forEach((message) => {
        const div = document.createElement("div");
        div.textContent = message;
        chatBox.appendChild(div);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
});
