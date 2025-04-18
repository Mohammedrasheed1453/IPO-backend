// // backend/src/services/ipoScraper.js
// import puppeteer from 'puppeteer';

// async function fetchUpcomingIPOs() {
//     let browser;
//     try {
//         browser = await puppeteer.launch({ 
//             headless: "new",
//             args: ['--no-sandbox', '--disable-setuid-sandbox']
//         });
//         const page = await browser.newPage();
//         await page.goto('https://www.screener.in/ipo/recent/', { 
//             waitUntil: 'networkidle2',
//             timeout: 60000
//         });

//         // Extract IPO data from the page
//         const ipoData = await page.evaluate(() => {
//             const rows = Array.from(document.querySelectorAll('table tbody tr'));
//             return rows.map(row => {
//                 const cells = row.querySelectorAll('td');
//                 const nameCell = cells[0]?.querySelector('a');
//                 const url = nameCell?.href || '';
                
//                 return {
//                     name: cells[0]?.innerText.trim() || '',
//                     listingDate: cells[1]?.innerText.trim() || '',
//                     ipoPrice: cells[2]?.innerText.trim().replace('₹', '') || '-',
//                     currentPrice: cells[3]?.innerText.trim().replace('₹', '') || '-',
//                     change: cells[4]?.innerText.trim() || '-',
//                     url: url
//                 };
//             });
//         });

//         return ipoData;
//     } catch (error) {
//         console.error('Error in web scraping:', error);
//         throw error;
//     } finally {
//         if (browser) await browser.close();
//     }
// }

// export { fetchUpcomingIPOs };

// backend/src/services/ipoScraper.js
import puppeteer from 'puppeteer';

async function fetchUpcomingIPOs() {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.goto('https://www.screener.in/ipo/recent/', {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        // Extract IPO data from the page
        const ipoData = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('table tbody tr'));
            return rows.map(row => {
                const cells = row.querySelectorAll('td');
                const nameCell = cells[0]?.querySelector('a');
                const url = nameCell?.href || '';

                // Extract data from cells
                const ipoMcap = cells[2]?.innerText.trim() || '-'; // IPO Mcap
                const ipoPrice = cells[3]?.innerText.trim().replace('₹', '') || '-'; // IPO Price
                const currentPrice = cells[4]?.innerText.trim().replace('₹', '') || '-'; // Current Price
                const changeText = cells[5]?.innerText.trim() || '-'; // % Change with arrow
                const changeValue = changeText.replace(/[↑↓]/g, '').trim(); // Extract just the numeric value
                const changeDirection = changeText.includes('↑') ? '↑' : changeText.includes('↓') ? '↓' : ''; // Determine direction

                return {
                    name: cells[0]?.innerText.trim() || '',
                    listingDate: cells[1]?.innerText.trim() || '',
                    ipoMcap: ipoMcap,
                    ipoPrice: ipoPrice,
                    currentPrice: currentPrice,
                    change: changeDirection + changeValue, // Combine direction and value
                    url: url
                };
            });
        });

        return ipoData;
    } catch (error) {
        console.error('Error in web scraping:', error);
        throw error;
    } finally {
        if (browser) await browser.close();
    }
}

export { fetchUpcomingIPOs };
