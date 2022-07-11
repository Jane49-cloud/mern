 const express = require('express')
 const app = express()
 const multer = require('multer')
 const upload = multer()
const sanitizeHtml= require('sanitize-html')
 const connection = require('./Db/db')
 const Animal = require('./models/animal')
 const FsExtra =require('fs-extra')
 const path = require('path')
const sharp = require('sharp')
const bodyParser =require('body-parser')
const cors  = require('cors')
const ObjectId = require('bson-objectid')
const React = require ('react')
const ReactDOMServer = require('react-dom/server')
const AnimalCard =require('../frontend/src/component/AnimalCard').default




app.use(bodyParser.json({ limit: '30mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true}))
 app.use(cors())

 // ensures that the folder is present when the site first loads
 FsExtra.ensureDirSync(path.join("public", "upoaded-photos"))

 app.use(express.static("public"))

 app.use('/uploads', express.static('upoaded-photos'));

app.set("view engine", "ejs")
app.set('views', './views')

app.use(express.json())
app.use(express.urlencoded({extended:false}))
 
 //Authentication

 function passwordprotected(req,res,next){
  res.set("WWW-Authenticate", "Basic realm='Our MERN App'")
  if((req.headers.authorization == "Basic amFuZW06MTIzNA==")){
    next()
  }
  else{
    console.log(req.headers.authorization)
    res.status(401).send("Try again")
  }

}
app.get("/", async(req,res)=>{
  const allAnimals =await Animal.find({})
  const generatedHTMl = ReactDOMServer.renderToString(
    <div className='container'>
      <div className='animal-grid mb-3'>
        {allAnimals.map(animal=><AnimalCard key={animal._id} name={animal.name} species ={animal.species} photo ={animal.photo} id ={animal._id} readonly={true}/>)}
        </div>
        <p><a href="/admin">Login/ manage animal listings</a></p> 
    </div>
  )
 res.render('home', {generatedHTMl})
 })

 app.use(passwordprotected)


 app.get("/admin" ,(req,res)=>{
    res.render("admin")
   })
// route to get all the animals
 
   app.get("/api/animals", async(req,res)=>{
    const allAnimals = await Animal.find({})
     res.json(allAnimals)   
   })

// route for creating  new animals

app.post('/create-animal',  upload.single("photo"), ourCleanUp, async(req,res)=>{  
  if(req.file){
    const photoName = `${Date.now()}.jpg`
    await sharp(req.file.buffer).resize(844,456).jpeg({quality:60}).toFile(path.join("public","upoaded-photos", photoName ))
    req.body.photo = photoName
  }
  const animal = await Animal.create(req.body)
 console.log(animal)
 res.json({animal})
   })

//Upload clean-up
function ourCleanUp(req,res,next){
  if (typeof  req.body.name != "string") req.body.name =""
  if (typeof  req.body.species != "string") req.body.name =""
  if (typeof  req.body._id!= "string") req.body.id =""

  req.cleanData ={
    name:sanitizeHtml(req.body.name.trim(), {allowedTags: [], allowedAttributes:{}}),
    species:sanitizeHtml(req.body.species.trim(), {allowedTags: [], allowedAttributes:{}})
  }
  next()
}
//update route
app.post('/update-animal', upload.single('photo'), ourCleanUp, async(req,res)=>{
  if(req.file){
    const photoName = `${Date.now()}.jpg`
    await sharp(req.file.buffer).resize(844,456).jpeg({quality:60}).toFile(path.join("public","upoaded-photos", photoName ))
    req.body.photo = photoName
    const info = await Animal.findByIdAndUpdate({_id : new ObjectId(req.body._id)}, {$set: req.body})
    if(info.value.photo){
      fse.remove(path.join("public", "uploaded-photos", info.value.photo))
    }
    res.send(photoName)
    }else{
     await Animal.findByIdAndUpdate({_id : new ObjectId(req.body._id)}, {$set: req.body})
      res.send(false)
  }
})


// delete route
app.delete("/animal/:id", async(req,res)=>{
  if(typeof req.params.id!='string') req.params.id == ""
  const {
    params: { id: animalId },    
  } = req
  const animal = await Animal.findByIdAndRemove({
    _id: new ObjectId(req.params.id)
  })
  if (!animal){
    res.send(`animal with ${animalId} id does not exist` )
  }

  res.send(`Animal with ${animalId} id was successfully deleted`)
  console.log(`deletion`)
})


//Start server after database is connected

 const start = async()=>{
  try {
    
   await connection()
    const port ='4000'
 app.listen(port, ()=>{
     console.log(`The server is running on port:${port}`)
 })

  } catch (error) {
  console.log(error);
  }
 }
 start()