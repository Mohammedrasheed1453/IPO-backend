// // backend/src/routes/ipoRoutes.js
// import express from 'express';
// import { fetchUpcomingIPOs } from '../services/ipoScraper.js';

// const router = express.Router();

// router.get('/upcoming-ipos', async (req, res) => {
//     try {
//         const data = await fetchUpcomingIPOs();
//         res.json(data);
//     } catch (error) {
//         console.error('Error fetching IPO data:', error);
//         res.status(500).json({ error: 'Failed to fetch IPO data' });
//     }
// });

// export default router;

// backend/src/routes/ipoRoutes.js
import express from 'express';
import { fetchUpcomingIPOs } from '../services/ipoScraper.js';

const router = express.Router();

const ITEMS_PER_PAGE = 10; // You can change this value

router.get('/upcoming-ipos', async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const startIndex = (page - 1) * ITEMS_PER_PAGE;

    try {
        let ipoData = await fetchUpcomingIPOs();
        const totalItems = ipoData.length;
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
        const paginatedData = ipoData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

        res.json({
            data: paginatedData,
            currentPage: page,
            totalPages: totalPages
        });
    } catch (error) {
        console.error("Error fetching IPO data:", error);
        res.status(500).json({ error: 'Failed to fetch IPO data' });
    }
});

export default router;
