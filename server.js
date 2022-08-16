const http = require("http");
const express = require("express");
const path = require("path");
const cors = require('cors');

const corsOptions = require('./config/cors.options');
const { logger } = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');

const PORT = process.env.PORT || 3500;
const app = express();
const server = http.createServer(app);

// custom middlewares
app.use(logger);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// serve static files
app.use(express.static(path.join(__dirname, "public")));
app.use('/subdir', express.static(path.join(__dirname, 'public')));

// routes
app.use('/', require('./routes/root'));
app.use('/subdir', require('./routes/subdir'));
app.use('/employees', require('./routes/api/employee'));

app.all("*", (req, res) => {
    res.status(404);
    if( req.accepts('html')) {
        res.sendFile(path.join(__dirname, "public", "views", "404.html"));
    } else if (req.accepts('json')) {
        res.json({error: "404 Not Found"});
    } else {
        res.type('txt').send("404 Not Found");
    }
});

// custom error handling
app.use(errorHandler);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
