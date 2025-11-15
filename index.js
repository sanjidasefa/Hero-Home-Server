require('dotenv').config();  
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors')

app.use(cors())
app.use(express.json())
        
const { MongoClient, ObjectId } = require('mongodb');

const client = new MongoClient(process.env.MONGO_URI, {
  serverApi: { version: '1' }
});

app.get('/', (req, res)=>{
  res.send('server is running')
})

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
      const result = await serviceCollection.find().sort({rating: -1}).limit(6).toArray()
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
      const data = req.body
      const result = await bookingCollection.insertOne(data)
      res.send(result)
    })

      app.get('/My-booking/:email' ,async(req, res)=>{
      const emailname = req.params.email;
      const result = await bookingCollection.find({booked_by : emailname}).toArray()
      res.send(result)
    })

    app.get('/search' , async (req, res )=> {
      const {search } = req.query
      const query = {};
      if(search){
        const num = parseFloat(search)
        if(!isNaN(num)){
          query.price = num
        }
        query.$or = [
          {title : {$regex : search, $options: 'i'}},
          {category : {$regex : search, $options: 'i'}}
        ]
      }
      
      const result = await serviceCollection.find(query).toArray();
      res.json(result)
    })

    app.post('/Service/:id/review' , async(req, res)=>{
      const id = req.params.id
      const {name , email , rating , comment,photo} = req.body;
      const review = {
        name ,email , rating : parseFloat(rating), comment,photo , createdAt : new Date()
      }
      const service  = await serviceCollection.findOne({_id : new ObjectId(id)})
      if(!service){
        return res.status(400).json({message : 'service not found'});
      }
      const currentReview = service.review || []
      const newRating = ((service.rating || 0)* currentReview.length + parseFloat(rating))/(currentReview.length + 1)
       await serviceCollection.updateOne(
        { _id : new ObjectId(id)},
        {
          $push : {reviews : review},
          $set: {rating: newRating}
        }
      )
      const updateReview = await serviceCollection.findOne({_id : new ObjectId(id)})
      res.json({
        reviews : updateReview.review,
        rating : updateReview.rating
      })
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