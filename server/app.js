import users from "./routers/usersRouter.js";
// import * as dotenv from "dotenv";
// dotenv.config();
import express from "express";
import { PrismaClient } from '@prisma/client';
import {
    expressjwt
} from "express-jwt";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());


const auth = expressjwt({
    secret: process.env["JWT_KEY"],
    algorithms: ["HS256"],
});

app.use((err, req, res, next) => {
    if (err.name === "UnauthorizedError") {
        return res.status(401).json({
            msg: "Ton JWT est invalide !"
        });
    }

    // autres erreurs à gérer
    next(err);
});


app.get("/secret", auth, (req, res) => {
    res.json({ msg: "Bravo tu as accès a cette route !" });
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});