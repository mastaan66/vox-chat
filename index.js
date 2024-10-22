const { log } = require('console');
const express = require('express');
const path = require('path');
const dialogflow = require('dialogflow');
const uuid = require('uuid');

const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// Serve static files from the 'public' directory
app.use('/public', express.static(path.join(__dirname, 'public'), {
    setHeaders: function(res, filePath) {
        if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

// Serve the index.html file on the root route
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: path.join(__dirname, 'views') });
});

// Dialogflow configuration
const projectId = 'your-project-id';  // Replace with your Dialogflow project ID
const sessionClient = new dialogflow.SessionsClient({
    keyFilename: 'path-to-your-service-account-file.json'  // Replace with your service account JSON file path
});

// Create a new session ID for each conversation
const sessionId = uuid.v4(); 

// Function to send messages to Dialogflow
async function sendToDialogflow(message, sessionId) {
    const sessionPath = sessionClient.sessionPath(projectId, sessionId);

    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: message,
                languageCode: 'en-US',  // Change to your preferred language
            },
        },
    };

    try {
        const responses = await sessionClient.detectIntent(request);
        const result = responses[0].queryResult;
        console.log(`Detected intent: ${result.intent.displayName}`);
        console.log(`Fulfillment text: ${result.fulfillmentText}`);
        return result.fulfillmentText;  // Return the response from Dialogflow
    } catch (err) {
        console.error('ERROR:', err);
    }
}

// Endpoint to handle incoming messages from the frontend
app.post('/send-message', async (req, res) => {
    const userMessage = req.body.message;

    // Send the user's message to Dialogflow and get a response
    const dialogflowResponse = await sendToDialogflow(userMessage, sessionId);

    // Send the Dialogflow response back to the client
    res.json({ reply: dialogflowResponse });

});

// Start the server
const server = app.listen(5000, () => {
    console.log('Server is running on http://localhost:5000');
});
