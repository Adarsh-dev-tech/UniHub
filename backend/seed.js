const mongoose = require('mongoose');
const Subject = require('./models/Subject');
require('dotenv').config();

const sampleSubjects = [
  {
    subjectName: 'Data Structures and Algorithms',
    subjectCode: 'CSC201',
    professorName: 'Dr. Smith',
    branch: 'Computer Science',
    year: 2,
    semester: 3,
    description: 'Introduction to fundamental data structures and algorithms',
    credits: 4
  },
  {
    subjectName: 'Database Management Systems',
    subjectCode: 'CSC301',
    professorName: 'Dr. Johnson',
    branch: 'Computer Science',
    year: 3,
    semester: 5,
    description: 'Database design, normalization, and SQL',
    credits: 4
  },
  {
    subjectName: 'Computer Networks',
    subjectCode: 'CSC302',
    professorName: 'Dr. Williams',
    branch: 'Computer Science',
    year: 3,
    semester: 5,
    description: 'Network protocols, TCP/IP, and network security',
    credits: 3
  },
  {
    subjectName: 'Software Engineering',
    subjectCode: 'CSC303',
    professorName: 'Dr. Brown',
    branch: 'Computer Science',
    year: 3,
    semester: 6,
    description: 'Software development lifecycle and methodologies',
    credits: 4
  },
  {
    subjectName: 'Machine Learning',
    subjectCode: 'CSC401',
    professorName: 'Dr. Davis',
    branch: 'Computer Science',
    year: 4,
    semester: 7,
    description: 'Introduction to machine learning algorithms and applications',
    credits: 4
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/unihub');
    console.log('Connected to MongoDB');

    // Clear existing subjects
    await Subject.deleteMany({});
    console.log('Cleared existing subjects');

    // Insert sample subjects
    const insertedSubjects = await Subject.insertMany(sampleSubjects);
    console.log(`Inserted ${insertedSubjects.length} subjects`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();