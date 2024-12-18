const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

//middleware
app.use(cors());
app.use(express.json());


const user = process.env.DB_USER;
const pass = process.env.DB_PASS;


const uri = `mongodb+srv://${user}:${pass}@cluster0.zee3o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        const menuCollection = client.db('BistroBossDB').collection('menu');
        const reviewsCollection = client.db('BistroBossDB').collection('reviews');
        const cartsCollection = client.db('BistroBossDB').collection('carts');
        const usersCollection = client.db('BistroBossDB').collection('users')

        //post user Data on DB
        app.post('/users', async (req, res) => {
            const users = req.body;
            const email = req.body.email;
            const userEmail = {email : email};
            const existUser = await usersCollection.findOne(userEmail);
            if(existUser){
                return res.send({message : 'user all ready save in database'})
            }
            else{
                const result = await usersCollection.insertOne(users);
                res.send(result);
            }
        })

        //get users Data from DB
        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result)
        })

        //Delete user Data from DB
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id : new ObjectId(id)};
            const result = await usersCollection.deleteOne(query);
            res.send(result);
        })

        //update user Data from DB
        app.patch('/user/admin/:id', async (req, res) => {
            const id = req.params.id;
            const { role } = req.body; 
            const query = {_id : new ObjectId(id)};
            if (!role || (role !== "admin" && role !== "user")) {
                return res.status(400).send({ message: "Invalid role. Role must be either 'admin' or 'user'." });
            }
            const updatedDoc = {
                $set : {
                    role : role
                }
            }
            const result = await usersCollection.updateOne(query, updatedDoc);
            res.send(result);
        })

        //get all menu Data from DB
        app.get('/menu', async (req, res) => {
            const result = await menuCollection.find().toArray();
            res.send(result);
        })

        //get all reviews Data form DB
        app.get('/reviews', async (req, res) =>{
            const result = await reviewsCollection.find().toArray();
            res.send(result);
        })

        //post cart Data on DB
        app.post('/carts', async (req, res) => {
            const cartItem = req.body;
            const result = await cartsCollection.insertOne(cartItem);
            res.send(result);
        })

        //get all cart Data by specific email from DB
        app.get('/carts/:email', async (req, res) => {
            const email = req.params.email;
            const query = {email : email};
            const result = await cartsCollection.find(query).toArray();
            res.send(result);
        })

        //delete cart data from DB
        app.delete('/carts/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id : new ObjectId(id)};
            const result = await cartsCollection.deleteOne(query);
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
    res.send('SERVER IS RUNNING NOW.......');
})

app.listen(port, () => {
    console.log(`server is running from port ${port}`);
})