const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors')

app.use(cors())
app.use(express.json())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
 
    app.get('/Service' , async(req, res)=>{
       const result = await serviceCollection.find().toArray()
       res.send(result)
    })

    app.get('/Service/:id' , async(req, res)=>{
      const id =req.params.id
      const query = {_id : new ObjectId(id)}
       const result = await serviceCollection.findOne(query)
       res.send(result)
    })
    
 app.get('/home' , async (req, res)=>{
      const result = await serviceCollection.find().limit(6).toArray()
      res.send(result)
    })

  app.post('/Service' , async(req, res)=>{
      const data = req.body
      const result = await serviceCollection.insertOne(data)
      res.send(result)
    })

    app.put('/Service/:id' , async (req , res)=>{
      const data = req.body
      const id = req.params.id
      const query = {_id : new ObjectId(id)}
      const update = {
        $set: data
      }
      const options = {}
      const result = await serviceCollection.updateOne(query , update , options)
      res.send(result)
    })
      
     app.get('/my-Services/:email' ,async(req, res)=>{
      const emailname = req.params.email;
      const result = await serviceCollection.find({email: emailname}).toArray()
      res.send(result)
    })

    app.delete('/Service/:id' , async (req , res)=>{
       const id = req.params.id
      const query = {_id : new ObjectId(id)}
      const result = await serviceCollection.deleteOne(query)
      res.send(result)
    })

    app.post('/My-booking' , async(req, res)=>{
      const data = req.data
      const result = await bookingCollection.insertOne(data)
      res.send(result)
    })

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