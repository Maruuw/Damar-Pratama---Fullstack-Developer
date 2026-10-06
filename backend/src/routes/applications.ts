import { Router } from "express";
import { prisma } from "../index";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// Apply for a job (Job Seeker)
router.post("/:jobId", authenticate, authorize(["JOB_SEEKER"]), async (req, res) => {
  try {
    const jobId = req.params.jobId as string;
    const user = (req as any).user;

    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_userId: { jobId, userId: user.id }
      }
    });

    if (existingApplication) {
      return res.status(400).json({ error: "You have already applied for this job" });
    }

    const application = await prisma.application.create({
      data: {
        jobId,
        userId: user.id,
        status: "APPLIED"
      }
    });

    await prisma.applicationHistory.create({
      data: {
        applicationId: application.id,
        newStatus: "APPLIED"
      }
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get applications for a Job Seeker
router.get("/me", authenticate, authorize(["JOB_SEEKER"]), async (req, res) => {
  try {
    const user = (req as any).user;
    const applications = await prisma.application.findMany({
      where: { userId: user.id },
      include: {
        job: {
          include: { company: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get applications for a Company's jobs
router.get("/company", authenticate, authorize(["COMPANY"]), async (req, res) => {
  try {
    const user = (req as any).user;
    const jobs = await prisma.job.findMany({
      where: { companyId: user.id },
      select: { id: true }
    });

    const jobIds = jobs.map((j: any) => j.id);

    const applications = await prisma.application.findMany({
      where: { jobId: { in: jobIds } },
      include: {
        job: true,
        user: { select: { id: true, name: true, email: true } },
        history: { orderBy: { changedAt: 'desc' } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update application status (Company)
router.patch("/:id/status", authenticate, authorize(["COMPANY"]), async (req, res) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    const user = (req as any).user;

    const application = await prisma.application.findUnique({
      where: { id },
      include: { job: true }
    });

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    if (application.job.companyId !== user.id) {
      return res.status(403).json({ error: "Forbidden: not your job" });
    }

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: { status }
    });

    await prisma.applicationHistory.create({
      data: {
        applicationId: id,
        oldStatus: application.status,
        newStatus: status
      }
    });

    res.json(updatedApplication);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
