const restify = require('restify');
const server = restify.createServer();

const io = require('socket.io')(server.server);
let sockets = new Set();

const corsMiddleware = require('restify-cors-middleware');
const port = 3000;

const cors = corsMiddleware({
    origins: ['*'],
});
var dbService = require('./common/dataService');

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
    let sql = "select qtag as Q,orders.order_id, food_name, quantity, orders.created_at,done  from order_trackings , foods , order_details , orders where foods.id = order_details.food_id and  order_details.order_id = order_trackings.order_id and orders.order_id = order_details. order_id";
    dbService.queryExec(sql, (err, result) => {
        if (!err) {
            res.json({ status: result });
        } else {
            res.json({ status: 'DB Error' });
        }
    });

});

server.post('/apis/order', (req, res) => {

    const order = req.body;
    let sql = "select qtag as Q,orders.order_id, food_name, quantity, orders.created_at,done  from order_trackings , foods , order_details , orders where foods.id = order_details.food_id and  order_details.order_id = order_trackings.order_id and orders.order_id = order_details. order_id";


    orders.push(order);

    for (const socket of sockets) {
        console.log('Emitting value:' + order);
        socket.emit('data', { data: orders });
    }
    res.json(order);
});

server.listen(port, () => console.info('Server started on port : ' + port));
