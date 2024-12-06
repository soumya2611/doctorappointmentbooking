import jwt from 'jsonwebtoken'

//ADMIN AUTH MIDDLEWARE
 
const authAdmin = async (req,res,next) => {
    try { 
        const {admintoken} = req.headers
        //console.log(admintoken)
        if (!admintoken) {
            return res.json({success:false,message:'not authorized login again didnot getting adminToken' })
        }
        const tokenDecode = jwt.verify(admintoken, process.env.JWT_SECRET)
       // console.log("decode data--:"+tokenDecode)
        
        if (tokenDecode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
          res.json({ success: false, message: "not auth login again" });
        }
        next()


    }
    catch (err) {
        res.json({ success: false, message: err.message })
        console.log(err)
 }   
}

export default authAdmin