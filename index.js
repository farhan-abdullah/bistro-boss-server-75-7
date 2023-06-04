const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();
//middleware
const corsConfig = {
	origin: '*',
	credential: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
};
app.use(cors(corsConfig));
app.use(express.json());

app.get('/', (req, res) => {
	res.send('Bistro boss Is running');
});

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.xozjpaf.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

async function run() {
	try {
		// Connect the client to the server	(optional starting in v4.7)
		await client.connect();

		const database = client.db('bistroDB');
		const menuCollection = database.collection('menu');
		const reviewsCollection = database.collection('reviews');
		const cartsCollection = database.collection('carts');
		const usersCollection = database.collection('users');
		app.get('/users', async (req, res) => {
			const result = await usersCollection.find().toArray();
			res.send(result);
		});
		app.post('/users', async (req, res) => {
			const user = req.body;
			const query = { email: user.email };
			const existingUser = await usersCollection.findOne(query);
			if (existingUser) {
				return res.send({ message: ' user already exists' });
			}
			const result = await usersCollection.insertOne(user);
			res.send(result);
		});
		// menu related api
		app.get('/menu', async (req, res) => {
			const result = await menuCollection.find().toArray();
			res.send(result);
		});
		//reviews related api
		app.get('/reviews', async (req, res) => {
			const result = await reviewsCollection.find().toArray();
			res.send(result);
		});
		//cart collection api
		app.post('/carts', async (req, res) => {
			const item = req.body;
			console.log(item);
			const result = await cartsCollection.insertOne(item);
			res.send(result);
		});
		app.get('/carts', async (req, res) => {
			const email = req.query.email;
			if (!email) {
				res.send([]);
			}
			const query = { email: email };
			const result = await cartsCollection.find(query).toArray();
			res.send(result);
		});
		app.delete('/carts/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const result = await cartsCollection.deleteOne(query);
			res.send(result);
		});
		app.patch('/users/admin/:id', async (req, res) => {
			const id = req.params.id;
			const filter = { _id: new ObjectId(id) };
			const updateDoc = {
				$set: {
					role: 'admin',
				},
			};
			const result = await usersCollection.updateOne(filter, updateDoc);
			res.send(result);
		});
		// Send a ping to confirm a successful connection
		await client.db('admin').command({ ping: 1 });
		console.log('Pinged your deployment. You successfully connected to MongoDB!');
	} finally {
		// Ensures that the client will close when you finish/error
		// await client.close();
	}
}
run().catch(console.dir);

app.listen(port, () => {
	console.log(` Bistro boss is running on port ${port} `);
});
