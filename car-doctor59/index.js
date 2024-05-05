const express = require('express')
const cors = require('cors')
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000;

const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');


// middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
}))
app.use(express.json());
app.use(cookieParser());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.S3_BUCKET}:${process.env.SECRET_KEY}@cluster0.okzu8ip.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

//  our middeware
const logger = async (req, res, next) => {
    console.log('called: ', req.host, req.originalUrl);
    next();
}
const veryfyToken = async (req, res, next) => {
    const token = req.cookies?.token;
    console.log(token);
    if (!token) {
        return res.status(401).send({ message: 'author unauthorize' })
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        // err
        if (err) {
            console.log(err);
            return res.status(401).send({ message: 'author unauthorize' })
        }
        // decoded undefined
        req.user = decoded
        console.log('value in the token', decoded);
        next();
    });
}


async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const serviceColection = client.db("carDoctor").collection("services");
        const bookingColection = client.db("carDoctor").collection("booking");
        // auth related
        app.post('/jwt', logger, async (req, res) => {
            const user = req.body;
            console.log(user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            res
                .cookie('token', token, {
                    httpOnly: true,
                    secure: false,
                    // sameSite: 'none' 
                })
                .send({ success: true });
        })


        // service related
        app.get('/services', logger, async (req, res) => {
            const cursor = serviceColection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };

            const options = {
                projection: { title: 1, price: 1, service_id: 1, img: 1 },
            };
            const result = await serviceColection.findOne(query, options);
            // const result = await cursor.toArray();
            res.send(result)
        })

        // booking
        app.get('/bookings', logger, veryfyToken, async (req, res) => {
            console.log(req.query.email);
            // console.log('tok tok token', req.cookies.token); 
            console.log('from in the user', req.user);
            if (req.query.email !== req.user.email) {
                return res.status(403).send({ message: 'forbidden' })
            }
            let query = {}
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await bookingColection.find(query).toArray();
            res.send(result)
        })
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            console.log(booking);
            const result = await bookingColection.insertOne(booking);
            res.send(result);
        })
        app.patch('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const booking = req.body;
            console.log(booking);
            const updateDoc = {
                $set: {
                    status: booking.status
                },
            };
            const result = await bookingColection.updateOne(query, updateDoc);
            res.send(result);
        })
        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await bookingColection.deleteOne(query);
            res.send(result);
        })



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})