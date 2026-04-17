async function testChainalysisSimple() {
    // The official Ashby public API endpoint
    const url = "https://api.ashbyhq.com/posting-api/job-board/chainalysis-careers";

    console.log("📡 Hitting the Ashby Public GET API...");

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        const data = await response.json();
        
        // Ashby GET API returns { "jobs": [...] }
        const jobs = data.jobs || [];

        console.log(`\n✅ SUCCESS! Found ${jobs.length} jobs.`);
        
        // Let's see the first few
        if (jobs.length > 0) {
            console.table(jobs.slice(0, 5).map(j => ({
                Title: j.title,
                Location: j.location,
                Link: j.jobUrl
            })));
        }

    } catch (error) {
        console.error("❌ Simple API also failed:", error.message);
    }
}

testChainalysisSimple();