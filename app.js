// COMMAND: npm run dev          ---------->         starts server with nodemon
const port = process.env.port || 9000;
const express = require('express');
const app = express();

// Specify where static assets
app.use(express.static('public'));

// backend api
app.get("/api", (req, res) => {
    console.log("called");
    res.json({"users": ["userOne", "userTwo", "userThree"]});
});

app.listen(port, () => {
    console.log('server up');
});
