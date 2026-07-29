import { Router, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import type { User, UserPayload, CustomRequest } from "../libs/types.ts";

// import database
import { users, enrollments, reset_users } from "../db/db";
import { success } from "zod";
import { authenticateToken } from "../middlewares/authenticateToken";
import { checkRoleAdmin } from "../middlewares/checkRoleAdmin";

const router = Router();

router.get('/', authenticateToken, (req: CustomRequest, res: Response) => {
    try {
        const payload_user = req.user;

        if (payload_user?.role === "ADMIN") {
            return res.status(200).json({
                ok: true,
                enrollments: enrollments,
            });
        }

        
        const studentEnrollments = enrollments.filter(
            (e) => e.studentId === payload_user?.studentId
        );

        return res.status(200).json({
            ok: true,
            enrollments: studentEnrollments,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Something is wrong, please try again",
            error: err
        });
    }
});

router.post('/', authenticateToken, (req: CustomRequest, res: Response) => {
    try {
        const payload_user = req.user;

        if (payload_user?.role === "ADMIN") {
            return res.status(403).json({
                ok: true,
                message: "Only Student can access this API route"
            });
        }

        const { courseNo } = req.body;

        
        enrollments.push({
            studentId: payload_user?.studentId || "",
            courseId: courseNo
        });

        return res.status(200).json({
            ok: true,
            message: "Enrollment successful",
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Something is wrong, please try again",
            error: err
        });
    }
});

router.delete('/', authenticateToken, (req: CustomRequest, res: Response) => {
    try {
        const payload_user = req.user;

        if (payload_user?.role === "ADMIN") {
            return res.status(403).json({
                ok: true,
                message: "Only Student can access this API route"
            });
        }

        
        return res.status(200).json({
            ok: true,
            message: "You has dropped from this course. See you next semester.",
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Something is wrong, please try again",
            error: err
        });
    }
});

export default router;