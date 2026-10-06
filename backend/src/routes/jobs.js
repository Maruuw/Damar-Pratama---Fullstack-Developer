"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../index");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get all jobs (Job Seeker & Company)
router.get("/", auth_1.authenticate, async (req, res) => {
    try {
        const jobs = await index_1.prisma.job.findMany({
            include: {
                company: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(jobs);
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});
// Get job details
router.get("/:id", auth_1.authenticate, async (req, res) => {
    try {
        const job = await index_1.prisma.job.findUnique({
            where: { id: req.params.id },
            include: {
                company: { select: { name: true } }
            }
        });
        if (!job)
            return res.status(404).json({ error: "Job not found" });
        res.json(job);
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});
// Create a new job (Company only)
router.post("/", auth_1.authenticate, (0, auth_1.authorize)(["COMPANY"]), async (req, res) => {
    try {
        const { title, location, salary, jobType } = req.body;
        const user = req.user;
        if (!title || !location || !salary || !jobType) {
            return res.status(400).json({ error: "All fields are required" });
        }
        const job = await index_1.prisma.job.create({
            data: {
                title,
                location,
                salary,
                jobType,
                companyId: user.id
            }
        });
        res.status(201).json(job);
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.default = router;
//# sourceMappingURL=jobs.js.map