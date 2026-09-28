const fs = require('fs');

const dataStr = fs.readFileSync('c:/Users/Admin/OneDrive/Desktop/Kiet/projects/smart/smart/src/data/studentInfoData.js', 'utf8');

let match = dataStr.match(/export const studentInfoData = (\[[\s\S]*?\]);\s*export const teams = /);
if (!match) {
    console.error("Could not parse");
    process.exit(1);
}

let students = JSON.parse(match[1]);

const updates = [
  { id: "shivamani", sub: "DEVC" },
  { id: "girish", sub: "DEVC" },
  { id: "NARADALA BALA MANIKANTA", sub: "DEVC" },
  { id: "TADICHARLA RATHNAM RAJU", sub: "DS" },
  { id: "236Q1A4523", sub: "EG" },
  { id: "23B21A4517", sub: "EG" },
  { id: "236Q1A4526", sub: "EG" },
  { id: "23B21A45A9", sub: "EG" },
  { id: "23B21A45D8", sub: "BEEE" },
  { id: "23B21A45G2", sub: "CHE, EWS" },
  { id: "23B21A45B8", sub: "CHE" },
  { id: "23B21A45C5", sub: "LAC, DEVC" },
  { id: "236Q1A4532", sub: "BEEE, EG" },
  { id: "23B21A4530", sub: "EG" },
  { id: "23B21A45A3", sub: "DEVC" },
  { id: "23B21A45B0", sub: "BCME" },
  { id: "23B21A45D6", sub: "EG" },
  { id: "23B21A45A8", sub: "EG" }
];

updates.forEach(update => {
    let student = students.find(s => 
        s.roll.toLowerCase() === update.id.toLowerCase() || 
        s.name.toLowerCase().includes(update.id.toLowerCase())
    );
    if (student) {
        let completedSubs = update.sub.split(',').map(s => s.trim());
        let currentSubs = student.backlogSubs ? student.backlogSubs.split(',').map(s => s.trim()) : [];
        
        completedSubs.forEach(csub => {
            let idx = currentSubs.findIndex(s => s.toLowerCase() === csub.toLowerCase());
            if (idx !== -1) {
                currentSubs.splice(idx, 1);
            } else {
                console.log(`Warning: ${csub} not found in backlogs for ${student.name} (${student.roll}). Current backlogs: ${student.backlogSubs}`);
            }
        });
        
        student.backlogSubs = currentSubs.join(', ');
        student.backlogs = currentSubs.length; 
        if (student.backlogs === 0) {
            student.backlogSubs = "";
        }
        console.log(`Updated ${student.name} (${student.roll}) -> ${student.backlogs} backlogs: ${student.backlogSubs}`);
    } else {
        console.log("NOT FOUND:", update.id);
    }
});

const newContent = `export const studentInfoData = ${JSON.stringify(students, null, 4)};\n\nexport const teams = ["TEAM-1", "TEAM-2", "TEAM-3", "TEAM-4", "TEAM-5", "TEAM-6", "TEAM-7", "TEAM-8", "TEAM-9", "TEAM-10", "TEAM-11", "TEAM-12"];\n`;

fs.writeFileSync('c:/Users/Admin/OneDrive/Desktop/Kiet/projects/smart/smart/src/data/studentInfoData.js', newContent, 'utf8');
console.log("Update completed");
