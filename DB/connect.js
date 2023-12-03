const mongoose = require('mongoose')

const connectDB =async  (url) => {
  try{
  await  mongoose.connect(url)
  console.log('connected')
}
  catch(err){
    console.log('Connection failed');
  }
}


module.exports = connectDB