const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.lang = 'en-US';
recognition.interimResults = false;

let text = ""; // Declare text variable outside the function

// Ensure the button element exists
document.querySelector('button').addEventListener('click', () => {
    console.log('Button clicked, starting recognition...');
    recognition.start();
});

recognition.addEventListener('result', (e) => {
    let last = e.results.length - 1;
    text = e.results[last][0].transcript; // Assign transcript to the text variable
    console.log('Result received: ', text);
    console.log('Confidence: ' + e.results[0][0].confidence);
});

const socket = io(); // Ensure Socket.IO is properly initialized

recognition.addEventListener('end', () => { 
    console.log('Speech recognition ended, emitting message:', text);
    socket.emit('chat message', text);  // Emit the message only if there's text
});

// Add error handling for microphone access or other recognition issues
recognition.addEventListener('error', (e) => {
    console.error('Speech recognition error:', e);
});
