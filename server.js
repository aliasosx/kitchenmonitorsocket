const restify = require('restify');
const server = restify.createServer();

const io = require('socket.io')(server.server);
let sockets = new Set();

const corsMiddleware = require('restify-cors-middleware');
const port = 3000;

const cors = corsMiddleware({
    origins: ['*'],
});

server.use(restify.plugins.bodyParser());
server.pre(cors.preflight);
server.use(cors.actual);

var orders = [];

io.on('connection', socket => {
    console.log('Client connected');
    sockets.add(socket);
    socket.emit('data', { data: orders });
    socket.on('clientData', data => console.log(data));
    socket.on('disconnect', () => sockets.delete(socket));
});

server.get('/', (req, res) => {
    res.json({ status: 'Server runing ' });
});

server.post('/apis/order', (req, res) => {
    const order = req.body;
    orders.push(order);

    for (const socket of sockets) {
        console.log('Emitting value:' + order);
        socket.emit('data', { data: orders });
    }
    res.json(order);
});

server.listen(port, () => console.info('Server started'));
