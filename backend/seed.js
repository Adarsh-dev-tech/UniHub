require('dotenv').config();
const mongoose = require('mongoose');
const Subject = require('./models/Subject');

const connectDB = require('./config/database');

const sampleSubjects = [
  // Computer Science - Year 1, Semester 1
  {
    subjectName: "Programming Fundamentals",
    subjectCode: "CS101",
    professorName: "Dr. Smith",
    branch: "Computer Science",
    year: 1,
    semester: 1
  },
  {
    subjectName: "Mathematics I",
    subjectCode: "MATH101",
    professorName: "Dr. Johnson",
    branch: "Computer Science",
    year: 1,
    semester: 1
  },
  {
    subjectName: "Physics I",
    subjectCode: "PHY101",
    professorName: "Dr. Williams",
    branch: "Computer Science",
    year: 1,
    semester: 1
  },
  // Computer Science - Year 1, Semester 2
  {
    subjectName: "Data Structures",
    subjectCode: "CS102",
    professorName: "Dr. Brown",
    branch: "Computer Science",
    year: 1,
    semester: 2
  },
  {
    subjectName: "Mathematics II",
    subjectCode: "MATH102",
    professorName: "Dr. Davis",
    branch: "Computer Science",
    year: 1,
    semester: 2
  },
  // Computer Science - Year 2, Semester 3
  {
    subjectName: "Object Oriented Programming",
    subjectCode: "CS201",
    professorName: "Dr. Miller",
    branch: "Computer Science",
    year: 2,
    semester: 3
  },
  {
    subjectName: "Database Management Systems",
    subjectCode: "CS202",
    professorName: "Dr. Wilson",
    branch: "Computer Science",
    year: 2,
    semester: 3
  },
  // Mechanical Engineering - Year 1, Semester 1
  {
    subjectName: "Engineering Mechanics",
    subjectCode: "ME101",
    professorName: "Dr. Anderson",
    branch: "Mechanical Engineering",
    year: 1,
    semester: 1
  },
  {
    subjectName: "Engineering Drawing",
    subjectCode: "ME102",
    professorName: "Dr. Taylor",
    branch: "Mechanical Engineering",
    year: 1,
    semester: 1
  }
];

async function seedDatabase() {
  try {
    await connectDB();
    
    // Clear existing subjects
    await Subject.deleteMany({});
    console.log('Cleared existing subjects');
    
    // Insert sample subjects
    await Subject.insertMany(sampleSubjects);
    console.log('Sample subjects inserted successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();