import puppeteer from 'puppeteer';

async function getGoldmanCredentials() {
    console.log("🔑 Initializing Goldman Sachs security handshake...");
    
    // Launching the browser
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    
    const page = await browser.newPage();

    try {
        // Navigate to the search page
        await page.goto('https://hdpc.fa.us2.oraclecloud.com/hcmUI/CandidateExperience/en/sites/LateralHiring/job-search', {
            waitUntil: 'networkidle2'
        });

        // Oracle is notoriously slow; we wait for the session to "bake"
        console.log("⏳ Waiting for session tokens to generate...");
        await new Promise(r => setTimeout(r, 5000));

        // Extract the Session Cookie
        const cookies = await page.cookies();
        const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');

        // Extract the CX-User-ID from Session Storage
        const cxUserId = await page.evaluate(() => {
            return sessionStorage.getItem('ORA_IRC_CX_USERID') || 
                   localStorage.getItem('ORA_IRC_CX_USERID');
        });

        await browser.close();

        if (!cxUserId) {
            throw new Error("Could not find ORA-IRC-CX-USERID. The site might have updated.");
        }
        
        console.log("✅ Credentials harvested.");
        return { cookie: cookieString, cxUserId };

    } catch (err) {
        await browser.close();
        throw err;
    }
}

// --- THIS IS THE TOP-LEVEL AWAIT THAT WAS CRASHING ---
try {
    const { cookie, cxUserId } = await getGoldmanCredentials();
    console.log(`\n🍪 Cookie: ${cookie.substring(0, 50)}...`);
    console.log(`🆔 CX User ID: ${cxUserId}`);
} catch (error) {
    console.error("❌ Handshake Failed:", error.message);
}