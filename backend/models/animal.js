const mongoose = require('mongoose')
const animalSchema = new mongoose.Schema(
  
    {name:{
        type:String,
        // required:[true,`please provide the name of the animal`]
    },
    species:{
        type:String,
        // required:[true,`please provide the species of the animal`]
    },
   photo:{
        type:String,
    },
}

)

module.exports =mongoose.model('Animal' , animalSchema)