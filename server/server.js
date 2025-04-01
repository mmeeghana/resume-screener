require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const upload = multer();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// Test route
app.get('/api/hello', (req, res) => {
  res.json({ message: '👋 Hello from Meghana’s Resume Screener API!' });
});

// ✅ Skills dictionary
const skillWeights = {
  java: 1.5, python: 1.5, html: 1, css: 1, javascript: 2,
  react: 2, node: 1.5, express: 1, mysql: 1, mongodb: 1,
  spring: 1.3, "spring boot": 1.5, "rest api": 1.2, docker: 1.2,
  kubernetes: 1.5, blockchain: 2.5, git: 1, github: 1, ai: 1.5,
  ml: 1.5, "machine learning": 2, "data structures": 2,
  algorithms: 2, typescript: 1.5, aws: 1.5, azure: 1.5,
  flask: 1, django: 1
};

app.post('/api/analyze-pdf', upload.single('resume'), async (req, res) => {
  const jobDescription = req.body.jobDescription;
  const buffer = req.file.buffer;

  try {
    const parsed = await pdfParse(buffer);
    const resumeText = parsed.text.toLowerCase();
    const jdText = jobDescription.toLowerCase();

    const allSkills = Object.keys(skillWeights);
    const jdSkills = allSkills.filter(skill => jdText.includes(skill));

    let matchedSkills = [];
    let missingSkills = [];
    let totalWeight = 0;
    let matchedWeight = 0;

    jdSkills.forEach(skill => {
      const weight = skillWeights[skill];
      totalWeight += weight;
      if (resumeText.includes(skill)) {
        matchedSkills.push(skill);
        matchedWeight += weight;
      } else {
        missingSkills.push(skill);
      }
    });

    const score = Math.floor((matchedWeight / totalWeight) * 100) || 0;

    res.json({
      score,
      skillsMatched: matchedSkills,
      skillsMissing: missingSkills
    });
  } catch (err) {
    console.error('Error parsing PDF:', err);
    res.status(500).json({ error: 'Failed to parse PDF' });
  }
});

// ✅ Mocked OpenAI AI Suggestions route (since API quota exceeded)
app.post('/api/suggest-pdf', upload.single('resume'), async (req, res) => {
    const jobDescription = req.body.jobDescription;
    const buffer = req.file.buffer;
  
    try {
      const parsed = await pdfParse(buffer);
      const resumeText = parsed.text;
  
      // 💡 Use the same mock suggestions as before
      const fakeSuggestions = `
  - Try including recent projects using technologies like React, Node.js, or Spring Boot.
  - Include experience with databases like MySQL or MongoDB.
  - Mention collaboration using Git/GitHub and any deployment tools.
  - Add metrics like performance improvements or team size where possible.
  - List any certifications, internships, or open source contributions.
      `;
  
      res.json({ suggestions: fakeSuggestions });
    } catch (err) {
      console.error('Error suggesting from PDF:', err);
      res.status(500).json({ error: 'PDF suggestion failed.' });
    }
  });
  

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
