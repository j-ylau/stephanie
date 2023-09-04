const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors')
const { spawn } = require('child_process');
const app = express();

app.use(cors({}));
app.use(bodyParser.json());

const upload = multer({ dest: 'uploads/' });
app.post('/api/uploadJSON', upload.single('file'), (req, res) => {
  const filePath = req.file.path;
  const rawData = fs.readFileSync(filePath);
  const students = JSON.parse(rawData);
  fs.unlinkSync(filePath); // Delete the temporary file
  res.send({ students });
});

app.post('/api/generate', (req, res) => {
  console.log("POST /api/generate called");
  const students = req.body.students;

  const process = spawn('python', ['./optimize_seating.py', JSON.stringify(students)]);
  console.log("optimization complete");
  
  process.stdout.on('data', (data) => {
    res.send({ students: JSON.parse(data) });
  });
  console.log('sending new seating chart')
});

app.listen(3001, () => {
    console.log('Server running on http://localhost:3001/');
  });
