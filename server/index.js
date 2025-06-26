const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Dummy data
const users = [
  { id: 1, username: 'angus', password: 'test123', name: 'Angus' },
  { id: 2, username: 'belinda', password: 'test123', name: 'Belinda' },
  { id: 3, username: 'camile', password: 'test123', name: 'Camile' },
];

const kids = [
  { id: 1, name: 'Angie', age: 7 },
  { id: 2, name: 'Brodie', age: 8 },
  { id: 3, name: 'Charlie', age: 6 },
];

const assignments = [
  { userId: 1, kidId: 1 }, // Angus -> Angie
  { userId: 2, kidId: 1 }, // Belinda -> Angie
  { userId: 3, kidId: 2 }, // Camile -> Brodie
  { userId: 3, kidId: 3 }, // Camile -> Charlie
];

const notes = [
  { kidId: 1, note: 'Angie was very helpful in class today.', date: '2024-06-01' },
  { kidId: 1, note: 'Angie needs to work on her listening skills.', date: '2024-06-10' },
  { kidId: 2, note: 'Brodie showed great improvement in math.', date: '2024-06-05' },
  { kidId: 2, note: 'Brodie was kind to a new student.', date: '2024-06-12' },
  { kidId: 3, note: 'Charlie participated well in group activities.', date: '2024-06-03' },
  { kidId: 3, note: 'Charlie needs to focus more during reading time.', date: '2024-06-11' },
];

const progress = [
  { kidId: 1, subject: 'Math', subcategory: 'Arithmetic', score: 85 },
  { kidId: 1, subject: 'Math', subcategory: 'Geometry', score: 78 },
  { kidId: 1, subject: 'Reading', subcategory: 'Comprehension', score: 90 },
  { kidId: 1, subject: 'Reading', subcategory: 'Fluency', score: 88 },
  { kidId: 2, subject: 'Math', subcategory: 'Arithmetic', score: 80 },
  { kidId: 2, subject: 'Math', subcategory: 'Geometry', score: 76 },
  { kidId: 2, subject: 'Reading', subcategory: 'Comprehension', score: 82 },
  { kidId: 2, subject: 'Reading', subcategory: 'Fluency', score: 79 },
  { kidId: 3, subject: 'Math', subcategory: 'Arithmetic', score: 88 },
  { kidId: 3, subject: 'Math', subcategory: 'Geometry', score: 85 },
  { kidId: 3, subject: 'Reading', subcategory: 'Comprehension', score: 80 },
  { kidId: 3, subject: 'Reading', subcategory: 'Fluency', score: 83 },
];

const attendance = [
  { kidId: 1, date: '2024-06-01', status: 'Present' },
  { kidId: 1, date: '2024-06-02', status: 'Absent' },
  { kidId: 1, date: '2024-06-03', status: 'Present' },
  { kidId: 2, date: '2024-06-01', status: 'Present' },
  { kidId: 2, date: '2024-06-02', status: 'Present' },
  { kidId: 2, date: '2024-06-03', status: 'Present' },
  { kidId: 3, date: '2024-06-01', status: 'Absent' },
  { kidId: 3, date: '2024-06-02', status: 'Present' },
  { kidId: 3, date: '2024-06-03', status: 'Present' },
];

// Simple session (in-memory for demo)
let sessions = {};

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  // Create a simple session token
  const token = Math.random().toString(36).substring(2);
  sessions[token] = user.id;
  res.json({ token, name: user.name });
});

// Auth middleware
function auth(req, res, next) {
  const token = req.headers['authorization'];
  if (!token || !sessions[token]) return res.status(401).json({ message: 'Unauthorized' });
  req.userId = sessions[token];
  next();
}

// Get kids for logged-in parent
app.get('/api/kids', auth, (req, res) => {
  const userId = req.userId;
  const kidIds = assignments.filter(a => a.userId === userId).map(a => a.kidId);
  const myKids = kids.filter(k => kidIds.includes(k.id));
  res.json(myKids);
});

// Get kid details (notes, progress, attendance)
app.get('/api/kids/:kidId', auth, (req, res) => {
  const kidId = parseInt(req.params.kidId);
  const kid = kids.find(k => k.id === kidId);
  if (!kid) return res.status(404).json({ message: 'Kid not found' });
  const kidNotes = notes.filter(n => n.kidId === kidId);
  const kidProgress = progress.filter(p => p.kidId === kidId);
  const kidAttendance = attendance.filter(a => a.kidId === kidId);
  res.json({ ...kid, notes: kidNotes, progress: kidProgress, attendance: kidAttendance });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 