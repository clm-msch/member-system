import * as dotenv from 'dotenv'
dotenv.config()

import express from "express"

import jwt from "jsonwebtoken";

import {
    z
} from "zod";

import createError from 'http-errors';

import {
    PrismaClient
} from '@prisma/client'

import bcrypt from "bcrypt"

const prisma = new PrismaClient()

// j'initialise un routeur
const router = express.Router()

const LoginValidator = z.object({
    email: z.string().email(),
    password: z.string().min(4).max(20)
});

router.post("/login", async (req, res, next) => {
    let loginData;
    try {
        loginData = LoginValidator.parse(req.body)
    } catch (error) {
        return res.status(400).json({
            errors: error.issues
        })
    }

    const user = await prisma.user.findFirst({
        where: {
            email: loginData.email
        },
    })

    if (!user) return next(createError(403, "Mauvais email / mot de passe"))

    const passwordIsGood = await bcrypt.compare(loginData.password, user.password)

    if (!passwordIsGood) return next(createError(403, "Mauvais email / mot de passe"))

    // puis on renvoie le token
    res.json({
        token: jwt.sign(
            // payload
            {},
            // clef pour signer le token
            process.env["JWT_KEY"],
            // durée du token
            {
                expiresIn: "30m",
            }
        ),
    });
});

router.post("/register", async (req, res, next) => {
    let loginData;
    try {
        loginData = LoginValidator.parse(req.body)
    } catch (error) {
        return res.status(400).json({
            errors: error.issues
        })
    }

    const user = await prisma.user.findFirst({
        where: {
            email: loginData.email
        },
    })

    if (user) return next(createError(400, "Un compte existe déjà avec cet email."))

    const hashedPassword = await bcrypt.hash(loginData.password, 10)

    await prisma.user.create({
        data: {
            email: loginData.email,
            password: hashedPassword
        },
    })

    // puis on renvoie le token
    res.json({
        msg: "User created"
    });
});

export default router