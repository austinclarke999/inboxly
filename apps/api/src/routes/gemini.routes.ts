import express from 'express';
import { categorizeEmail, summarizeEmail } from '../services/gemini.service';

const router = express.Router();

router.post('/categorize', async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) {
            res.status(400).json({ error: 'Content is required' });
            return;
        }
        const category = await categorizeEmail(content);
        res.json({ category });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/summarize', async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) {
            res.status(400).json({ error: 'Content is required' });
            return;
        }
        const summary = await summarizeEmail(content);
        res.json({ summary });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
