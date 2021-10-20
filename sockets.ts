const node_server = require('./server.js');

var options = { /* ... */};
var io = require('socket.io')(node_server, options);

io.on('connection', async (socket:any) => {
    debug.print_connection_established('CONNECTION')
})