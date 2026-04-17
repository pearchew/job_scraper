const fs = require('fs');

async function scrapeAllHSBCJobs() {
  let start = 0;
  let hasMoreJobs = true;
  let allJobs = [];
  const batchSize = 10; 
  
  // Our filters
  const excludeWords = ["head", "manager", "chief", "director", "vp", "president", "lead"];
  const targetLocation = "hong kong"; // NEW: The location we want to keep
  const importTime = new Date().toISOString(); // NEW: Get current import timestamp

  console.log(`Fetching ALL HSBC jobs in ${targetLocation.toUpperCase()}...`);

  while (hasMoreJobs) {
    if (start % 100 === 0 && start > 0) console.log(`Scanned ${start} jobs...`);

    const url = `https://portal.careers.hsbc.com/api/apply/v2/jobs?domain=hsbc.com&start=${start}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      const positions = data.positions || [];
      
      if (positions.length === 0) {
        console.log("Reached the end of the database!");
        hasMoreJobs = false; 
        break; 
      }
      
      for (let i = 0; i < positions.length; i++) {
        let job = positions[i];
        let jobTitle = job.name.toLowerCase();
        
        // NEW: Grab the location and make it lowercase so "Hong Kong" matches "hong kong"
        let jobLocation = job.location ? job.location.toLowerCase() : "";

        // Check our filters
        let isExcluded = excludeWords.some(word => jobTitle.includes(word));
        let isRightLocation = jobLocation.includes(targetLocation); // NEW: Does it include Hong Kong?

        // NEW: Only save the job if it is NOT excluded AND it IS in the right location
        if (!isExcluded && isRightLocation) {
          allJobs.push({
            Title: job.name.replace(/,/g, ''),             
            Location: job.location.replace(/,/g, ' '),
            Link: job.canonicalPositionUrl
          });
        }
      }
      
      start += batchSize;
      
    } catch (error) {
      console.error(`Whoops, something broke: ${error.message}`);
      break;
    }
  }
  
  console.log(`\n--- SUCCESS ---`);
  console.log(`Total Hong Kong jobs kept: ${allJobs.length}`);
  
  const csvFileName = 'hk_jobs.csv';
  let csvContent = '';
  
  // Check if file exists - only add headers if it's a new file
  const fileExists = fs.existsSync(csvFileName);
  
  if (!fileExists) {
    csvContent = "Title,Location,Link,ImportTime\n";
  }
  
  // Append jobs with timestamp
  allJobs.forEach(job => {
    csvContent += `${job.Title},${job.Location},${job.Link},${importTime}\n`;
  });

  // Append to file (create if doesn't exist)
  fs.appendFileSync(csvFileName, csvContent);
  console.log("Saved to hk_jobs.csv! You can open it now.");
}

scrapeAllHSBCJobs();