import { Router } from "express";
import { prisma } from "../index";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// Get all jobs (Job Seeker & Company)
router.get("/", authenticate, async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      include: {
        company: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get job details
router.get("/:id", authenticate, async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id as string },
      include: {
        company: { select: { name: true } }
      }
    });
    if (!job) return res.status(404).json({ error: "Job not found" });
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new job (Company only)
router.post("/", authenticate, authorize(["COMPANY"]), async (req, res) => {
  try {
    const { title, location, salary, jobType } = req.body;
    const user = (req as any).user;

    if (!title || !location || !salary || !jobType) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const job = await prisma.job.create({
      data: {
        title,
        location,
        salary,
        jobType,
        companyId: user.id
      }
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
