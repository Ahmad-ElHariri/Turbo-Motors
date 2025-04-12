const socket = io();
const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");


let username;
do {
    username = prompt("Enter your name:").trim();
} while (!username);
socket.emit("joinRoom", username);

function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
        socket.emit("chatMessage", { text: message });
        messageInput.value = "";
        messageInput.focus();
    }
}

sendButton.addEventListener("click", () => {
    sendMessage();
});

messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

function displayMessage(sender, message, className) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", className);
    if (sender === "Greeting") {
        messageDiv.textContent = message;
    } else {
        messageDiv.textContent = `${sender}: ${message}`;
    }
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}


socket.on("message", (message) => {
    const colonIndex = message.indexOf(": ");
    if (colonIndex !== -1) {
        const sender = message.substring(0, colonIndex);
        const text = message.substring(colonIndex + 2);
        const isAdmin = sender === "Admin";
        const className = isAdmin ? "admin-message" : "user-message";
        displayMessage(sender, text, className);
    } else {
        displayMessage("Greeting", message, "user-message");
    }
});


socket.on("previousMessages", (messages) => {
    chatBox.innerHTML = "";  
    messages.forEach((message) => {
        const colonIndex = message.indexOf(": ");
        if (colonIndex !== -1) {
            const sender = message.substring(0, colonIndex);
            const text = message.substring(colonIndex + 2);
            const isAdmin = sender === "Admin";
            const className = isAdmin ? "admin-message" : "user-message";
            displayMessage(sender, text, className);
        } else {
            displayMessage("Greeting", message, "user-message");
        }
    });
    chatBox.scrollTop = chatBox.scrollHeight;
});
