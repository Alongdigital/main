const messages = [
    "Welcome to Along Digital! 💙",
    "Dream Big. Create Bigger. 🚀",
    "Every great idea starts somewhere. ✨",
    "Technology is our playground! ⚡",
    "Thanks for being a part of our journey! ❤️",
    "Stay Creative. Stay Digital. 🌐"
];

function showMessage() {
    const random = Math.floor(Math.random() * messages.length);

    document.getElementById("message").textContent =
        messages[random];
}



