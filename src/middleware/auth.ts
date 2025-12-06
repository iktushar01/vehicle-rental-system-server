import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../config";

const auth = () => {
    return (req: Request, res: Response, next: NextFunction) => {
        const token = req.headers.authorization;
        console.log({authtoken : token});
        if(!token) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            })
        }
        const decoded = jwt.verify(token, config.jwtSecret as string);
        if(!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            })
        }
        console.log({decoded : decoded});
        req.user = decoded as JwtPayload;
        next();
    }
}

export default auth;