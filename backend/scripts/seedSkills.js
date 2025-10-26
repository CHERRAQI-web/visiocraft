import mongoose from 'mongoose';
import Skill from '../models/skill.models.js';
import dotenv from 'dotenv';

dotenv.config();

const skillsToSeed = [
  // Frontend
  { name: 'React.js', category: 'Frontend' },
  { name: 'Next.js', category: 'Frontend' },
  { name: 'Vue.js', category: 'Frontend' },
  { name: 'HTML', category: 'Frontend' },
  { name: 'CSS', category: 'Frontend' },
  { name: 'JavaScript', category: 'Frontend' },
  { name: 'TypeScript', category: 'Frontend' },
  { name: 'Tailwind CSS', category: 'Frontend' },

  // Backend
  { name: 'Node.js', category: 'Backend' },
  { name: 'Express.js', category: 'Backend' },
  { name: 'Python', category: 'Backend' },
  { name: 'Django', category: 'Backend' },
  { name: 'PHP', category: 'Backend' },
  { name: 'Laravel', category: 'Backend' },

  // Database
  { name: 'MongoDB', category: 'Database' },
  { name: 'PostgreSQL', category: 'Database' },
  { name: 'MySQL', category: 'Database' },

  // Design & UI/UX
  { name: 'UI/UX Design', category: 'Design' },
  { name: 'Figma', category: 'Design' },
  { name: 'Adobe Photoshop', category: 'Design' },
  { name: 'Logo Design', category: 'Design' },
  { name: 'Minimalism', category: 'Design' },
  { name: 'Color Theory', category: 'Design' },
  { name: 'Typography', category: 'Design' },

  // Tools & Concepts
  { name: 'Git', category: 'Tool' },
  { name: 'Docker', category: 'Tool' },
  { name: 'AWS', category: 'Cloud' },
  { name: 'REST APIs', category: 'Concept' },
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for seeding...');

        await Skill.deleteMany({});
        console.log('Skills collection cleared.');

        await Skill.insertMany(skillsToSeed);
        console.log(`${skillsToSeed.length} skills seeded successfully!`);

        await mongoose.connection.close();
        console.log('MongoDB connection closed.');
    } catch (error) {
        console.error('Error seeding skills:', error);
        process.exit(1);
    }
};

seedDB();