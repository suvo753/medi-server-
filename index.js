const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const dotenv = require('dotenv');
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs');
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


const verify = async(req,res,next)=> {
  const authHeader = await req?.headers?.authorization;

  if(!authHeader){
    return res.status(401).json({message:'Unauthorized'})
  }


  const token = authHeader?.split(" ")[1] 

  if(!token){
     return res.status(401).json({message:'Unauthorized'})
  }

  const JWKS = createRemoteJWKSet(
    new URL(`${process.env.CLIENT_SIDE_URL}/api/auth/jwks`)
  )

  try {
    const {payload} = await jwtVerify(token,JWKS);
    console.log(payload);
    next();
    
  } catch (error) {

    return res.status(401).json({message:'Unauthorized'});
    
  }







}




async function run() {
  try {
   
    // await client.connect();

    const db = client.db('mediquery');
    const collection_Data = db.collection('tutors');
    const collection_Booking = db.collection('booking');


    app.get('/my-tutors/:userId', verify, async(req,res)=> {
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


    app.get('/my-booking-tutors/:userId',async(req,res)=>{

      const {userId} = req.params;
      const result = await collection_Booking.find({userId:userId}).toArray();

      res.send(result);


    })


    app.patch('/my-booking-tutors-status/:userId', async(req,res)=> {

      const {userId} = req.params;
      const result = await collection_Booking.updateOne({_id :new ObjectId(userId)},{$set:{status:'Cancel'}})
      res.send(result);



    })

    app.patch('/my-booking-tutors/:userId', verify,  async(req,res)=> {

      const {userId} = req.params;
      const bookingData = await req.body;

      await collection_Data.updateOne({_id: new ObjectId(userId)}, {
        $inc:{totalSlots: -1}
      })

      const result = await collection_Booking.insertOne(
        {...bookingData,
          status: 'Confirmed'
        }
      )

      res.send(result);



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

app.get('/tutors', async (req, res) => {
  const { search } = req.query;

  let data;

  if (search) {
    data = await collection_Data.find({
      $or: [
        {
          tutorName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          subject: {
            $regex: search,
            $options: "i",
          },
        },
      ],
    }).toArray();
  } else {
    data = await collection_Data.find().toArray();
  }

  res.send(data);
});









    
    app.get('/tutorslimit', async(req,res)=> {
      const data = await collection_Data.find().limit(6).toArray();
      res.send(data); 
    })

    app.get('/tutors/:id',verify,async(req,res)=>{


        const {id} = req.params;

        const query = {
            _id: new ObjectId(id)

        }


        const result = await collection_Data.findOne(query);

        // console.log(result);

        res.send(result);

    })








    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

    // await client.close();
  }
}
run().catch(console.dir);
















app.listen(port,()=> {

    console.log(`server running ${port}`);
})