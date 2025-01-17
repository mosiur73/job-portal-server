require('dotenv').config()
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();



// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.juc5u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    
    const jobCollection = client.db("jobPortal").collection('jobs');
    const jobApplicationCollection = client.db('jobPortal').collection('job_applications');


    //1
    app.get('/jobs',async(req,res) =>{
        const curser=jobCollection.find();
        const result=await curser.toArray();
        res.send(result)
    })

    //2
    app.get('/jobs/:id',async(req,res) =>{
        const id=req.params.id;
        const query={_id: new ObjectId(id)}
        const result=await jobCollection.findOne(query)
        res.send(result)
  })

  //job application api
  //1
  app.post('/job-applications', async (req, res) => {
    const application = req.body;
    const result = await jobApplicationCollection.insertOne(application);
    res.send(result);
})

// get data 
app.get('/job-application', async (req, res) => {
  const email = req.query.email;
  const query = { applicant_email: email }
  const result = await jobApplicationCollection.find(query).toArray();

              // fokira way to aggregate data
              for (const application of result) {
                console.log(application.job_id)
                const query1 = { _id: new ObjectId(application.job_id) }
                const job = await jobCollection.findOne(query1);
                if(job){
                    application.title = job.title;
                    application.location = job.location;
                    application.company = job.company;
                    application.company_logo = job.company_logo;
                }
            }

  res.send(result)
})


  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('job portal server is running ....')
})

app.listen(port, () => {
    console.log(`job portal server  is running in port: ${port}`);
})