"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = require("../index");
const router = (0, express_1.Router)();
router.post("/register", async (req, res) => {
    try {
        const { email, password, name, role } = req.body;
        if (!email || !password || !name || !role) {
            return res.status(400).json({ error: "All fields are required" });
        }
        const existingUser = await index_1.prisma.user.findUnique({ where: { email } });
        if (existingUser)
            return res.status(400).json({ error: "Email already in use" });
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await index_1.prisma.user.create({
            data: { email, password: hashedPassword, name, role },
        });
        res.status(201).json({ message: "User created successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await index_1.prisma.user.findUnique({ where: { email } });
        if (!user)
            return res.status(400).json({ error: "Invalid credentials" });
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ error: "Invalid credentials" });
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || "super-secret-jwt-key", { expiresIn: "1d" });
        res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map