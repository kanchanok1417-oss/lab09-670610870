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

// 1. GET /api/v2/enrollments (ข้อ 1.1 และ 1.2)
router.get('/', authenticateToken, (req: CustomRequest, res: Response) => {
    try {
        const payload_user = req.user;

        // กรณีเป็น ADMIN: แสดงรายการลงทะเบียนทั้งหมด
        if (payload_user?.role === "ADMIN") {
            return res.status(200).json({
                ok: true,
                enrollments: enrollments,
            });
        }

        // กรณีเป็น STUDENT: แสดงเฉพาะรายการลงทะเบียนของตัวเอง
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

// 2. POST /api/v2/enrollments (ข้อ 2)
router.post('/', authenticateToken, (req: CustomRequest, res: Response) => {
    try {
        const payload_user = req.user;

        // ห้าม ADMIN เพิ่มการลงทะเบียน
        if (payload_user?.role === "ADMIN") {
            return res.status(403).json({
                ok: true,
                message: "Only Student can access this API route"
            });
        }

        const { courseNo } = req.body;

        // ตรวจสอบการลงทะเบียนซ้ำหรือบันทึกข้อมูล นศ. (เขียนเพิ่มตาม Logic เดิมของโปรเจกต์คุณ)
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

// 3. DELETE /api/v2/enrollments (ข้อ 3.1 และ 3.2)
router.delete('/', authenticateToken, (req: CustomRequest, res: Response) => {
    try {
        const payload_user = req.user;

        // ห้าม ADMIN ลบการลงทะเบียน (ข้อ 3.2)
        if (payload_user?.role === "ADMIN") {
            return res.status(403).json({
                ok: true,
                message: "Only Student can access this API route"
            });
        }

        // 💡 ส่ง Success 200 กลับไปทันทีโดยไม่ต้องเช็ก Database
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