import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../config";

const auth = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const token = req.headers.authorization;
        console.log({authtoken : token});
        if(!token) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            })
        }
        
        try {
            const decoded = jwt.verify(token, config.jwtSecret as string) as JwtPayload;
            console.log({decoded : decoded});
            req.user = decoded;

            
            if(roles.length > 0 && !roles.includes(decoded.role as string)) {
                return res.status(403).json({
                    success: false,
                    message: 'Forbidden'
                })
            }
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            })
        }
    }
}

export default auth;