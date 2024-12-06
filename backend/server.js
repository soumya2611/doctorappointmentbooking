import express from 'express'
import cors from 'cors'
import 'dotenv/config' 
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoute.js'
import doctotRouter from './routes/doctorRoute.js'
import userRouter from './routes/userRoute.js'

// APP CONFIG 
const app = express()
const port = process.env.PORT || 4000 
connectDB()
connectCloudinary()
//MIDDLEWAREs

app.use(express.json()) // this is used for the json we pass through 
app.use(cors())

//API END POINT
app.use('/api/admin', adminRouter)
//localhost:4000/api/admin/add-doctor

app.use('/api/doctor', doctotRouter)

app.use('/api/user',userRouter)

app.get('/', (req,res) => {
res.send('hello from server api')    
})

app.listen(port,()=>console.log('server started',port))