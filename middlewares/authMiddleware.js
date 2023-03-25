const jwt = require("jsonwebtoken");

const Users = require("../models/usersModel");

const protect = async (req, res, next) => {
  try {
    // Extract token from authorization header
    const token =
      req.headers.authorization?.startsWith("Bearer") &&
      req.headers.authorization.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "Not authorized" });
    }

    // Use async version of token verification
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by id decoded from token
    const user = await Users.findById(decodedToken.id);

    if (!user || !user.token) {
      return res.status(401).json({ message: "Not authorized" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

////////////////////////////////////////////////////////////////////////////////////////////

// const protect = async (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader) {
//     return res.status(401).json({ message: "Not authorized" });
//   }

//   const token = authHeader.split(" ")[1];
//   try {
//     const decodedToken = jwt.verify(token, process.env.JWT_SECRET); // 'secret' здесь должен быть секретный ключ для подписи токена
//     const userId = decodedToken.id;
//     const user = await Users.findById(userId);

//     if (!user || user.token !== token) {
//       return res.status(401).json({ message: "Not authorized" });
//     }
//     req.user = user;
//     next();
//   } catch (error) {
//     return res.status(401).json({ message: "Not authorized" });
//   }
// };

// module.exports = authMiddleware;

////////////////////////////////////////////////////////////////////////////////////////////

// const auth = async (req, res, next) => {
//   const { authorization = "" } = req.headers;
//   const [bearer, token] = authorization.split(" ");
//   try {
//     if (bearer !== "Bearer") {
//       next(res.status(401).json({ message: "Not authorized" }));
//     }
//     const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await Users.findById(decodedToken.id);
//     if (!user || !user.token) {
//       next(res.status(401).json({ message: "Not authorized" }));
//     }
//     req.user = user;
//     next();
//   } catch (error) {
//     next(error);
//   }
// };

// const auth = async (req, res, next) => {
//   const { authorization = "" } = req.headers;
//   const { bearer, token } = authorization.split(" ");

//   try {
//     if (bearer !== "Bearer") {
//       next(res.status(401).json({ message: "Not authorized" }));
//     }
//     // if (bearer !== "Bearer") {
//     //   return res.status(401).json({ message: "Not authorized" });
//     // }

//     const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await Users.findById(decodedToken.id);

//     //     if (!user || !user.token) {
//     //       next(res.status(401).json({ message: "Not authorized" }));
//     //     }
//     if (!user) {
//       return res.status(401).json({ message: "Not authorized" });
//     }

//     req.user = user;
//     next();
//   } catch (error) {
//     if ((error.message = "Invalid signature")) {
//       error.status = 401;
//     }
//     next(error);
//   }
// };

module.exports = { protect };
