const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const port = 9090 ;

app.use(cors());
app.use(express.json());




app.get('/',async(req,res)=> {
    res.send('server is Find ')
    
    
})


const uri = process.env.MONGO_URL;





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

    const db = client.db('mediquery');
    const collection_Data = db.collection('tutors');


    app.get('/my-tutors/:userId',async(req,res)=> {
      const {userId} = req.params;
      const query={userId:(userId)};
      const result =await collection_Data.find(query).toArray();
      res.send(result);     
    })


    app.delete('/my-tutors/:userId', async(req,res)=> {
      const {userId}= await req.params;
      const result = await collection_Data.deleteOne({_id: new ObjectId(userId)})
      res.send(result)


    })

    app.patch('/my-tutors/:userId', async(req,res)=> {

      const {userId} = req.params;
      const data = await req.body;

      const result = await collection_Data.updateOne(


        {_id : new ObjectId(userId)},
        {$set : data}

      ) 
      res.send(result);
      console.log(result);

      


    })


    app.post('/tutors',async(req,res)=> {
      const data = await req.body ;
      const result = await collection_Data.insertOne(data);
      console.log(result);
      res.send(result);
    })



    app.get('/tutors',async (req,res)=> {
        const data = await collection_Data.find().toArray();
        res.send(data);

    })
    app.get('/tutorslimit', async(req,res)=> {
      const data = await collection_Data.find().limit(6).toArray();
      res.send(data); 
    })

    app.get('/tutors/:id',async(req,res)=>{


        const {id} = req.params;

        const query = {
            _id: new ObjectId(id)

        }


        const result = await collection_Data.findOne(query);

        // console.log(result);

        res.send(result);

    })








    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

    // await client.close();
  }
}
run().catch(console.dir);
















app.listen(port,()=> {

    console.log(`server running ${port}`);
})