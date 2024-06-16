import jsonwebtoken from "jsonwebtoken";
import jwtConfig from "../config/jwtConfig.js";

const { sign, verify } = jsonwebtoken;

export function createToken(user) {
  return sign({ id: user.id }, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  });
}

export function verifyToken(res, next) {
  let token = res.headers["authorization"];
  if (!token) {
    return res
      .status(403)
      .send({ message: "Token je potreban za autentifikaciju." });
  }
  token = token.replace(/^Bearer\s+/, "");
  verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorised access." });
    }
    res.userId = decoded.id;
    next();
  });
}

export const authController = {
  login: (req, res) => {
    const user = req.body;
    const token = createToken(user);
    res.send({ token });
  },
  verify: (req, res) => {
    res.send({ message: "Token is valid." });
  },
};
