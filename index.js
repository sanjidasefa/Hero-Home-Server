const express = require('express');
const app = express();
const port = process.env.PORT || 6000;
const cors = require('cors')

app.use(cors())
app.use(express.json())

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://Hero-Home:KK3LEiKgxQXTcBnd@cluster0.gwptqtl.mongodb.net/?appName=Cluster0";

app.get('/', (req, res)=>{
  res.send('server is running')
})

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try { 
    await client.connect();
    const database = client.db('HeroDb')
    const serviceCollection = database.collection('Services')
    const bookingCollection = database.collection('Bookings')

    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port , ()=>{
  console.log(`server is running port ${port}`)
})