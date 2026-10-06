"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../index");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Apply for a job (Job Seeker)
router.post("/:jobId", auth_1.authenticate, (0, auth_1.authorize)(["JOB_SEEKER"]), async (req, res) => {
    try {
        const { jobId } = req.params;
        const user = req.user;
        const existingApplication = await index_1.prisma.application.findUnique({
            where: {
                jobId_userId: { jobId, userId: user.id }
            }
        });
        if (existingApplication) {
            return res.status(400).json({ error: "You have already applied for this job" });
        }
        const application = await index_1.prisma.application.create({
            data: {
                jobId,
                userId: user.id,
                status: "APPLIED"
            }
        });
        await index_1.prisma.applicationHistory.create({
            data: {
                applicationId: application.id,
                newStatus: "APPLIED"
            }
        });
        res.status(201).json(application);
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});
// Get applications for a Job Seeker
router.get("/me", auth_1.authenticate, (0, auth_1.authorize)(["JOB_SEEKER"]), async (req, res) => {
    try {
        const user = req.user;
        const applications = await index_1.prisma.application.findMany({
            where: { userId: user.id },
            include: {
                job: {
                    include: { company: { select: { name: true } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(applications);
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});
// Get applications for a Company's jobs
router.get("/company", auth_1.authenticate, (0, auth_1.authorize)(["COMPANY"]), async (req, res) => {
    try {
        const user = req.user;
        const jobs = await index_1.prisma.job.findMany({
            where: { companyId: user.id },
            select: { id: true }
        });
        const jobIds = jobs.map(j => j.id);
        const applications = await index_1.prisma.application.findMany({
            where: { jobId: { in: jobIds } },
            include: {
                job: true,
                user: { select: { id: true, name: true, email: true } },
                history: { orderBy: { changedAt: 'desc' } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(applications);
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});
// Update application status (Company)
router.patch("/:id/status", auth_1.authenticate, (0, auth_1.authorize)(["COMPANY"]), async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const user = req.user;
        const application = await index_1.prisma.application.findUnique({
            where: { id },
            include: { job: true }
        });
        if (!application) {
            return res.status(404).json({ error: "Application not found" });
        }
        if (application.job.companyId !== user.id) {
            return res.status(403).json({ error: "Forbidden: not your job" });
        }
        const updatedApplication = await index_1.prisma.application.update({
            where: { id },
            data: { status }
        });
        await index_1.prisma.applicationHistory.create({
            data: {
                applicationId: id,
                oldStatus: application.status,
                newStatus: status
            }
        });
        res.json(updatedApplication);
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.default = router;
//# sourceMappingURL=applications.js.map