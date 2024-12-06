import jwt from "jsonwebtoken";

//USER  AUTH MIDDLEWARE

const authUser = async (req, res, next) => {
  try {
    const { token } = req.headers;
    //console.log("middleware " + token);
    if (!token) {
      return res.json({
        success: false,
        message: "not authorized login again didnot getting token",
      });
    }
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    //console.log("decode data--:" + tokenDecode.id);

    req.body.userId = tokenDecode.id;
    //tokenDecode.id means here {.id } comes from when we sign the jwt we pass this { id: user._id }]  

    next();
  } catch (err) {
    res.json({ success: false, message: err.message });
    console.log(err);
  }
};

export default authUser;
