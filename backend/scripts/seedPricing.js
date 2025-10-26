import mongoose from 'mongoose';
import PricingBenchmark from '../models/pricingBenchmark.models.js';
import Skill from '../models/skill.models.js';
import dotenv from 'dotenv';

dotenv.config();

const pricingData = [
  {
    project_type: "Logo Design",
    complexity: "low",
    average_price: 1500,
    price_range: { min: 800, max: 2500 },
    source: "Market Research 2024",
    related_skills: [] // On va remplir ça après
  },
  {
    project_type: "E-commerce Website",
    complexity: "medium",
    average_price: 20000,
    price_range: { min: 15000, max: 35000 },
    source: "Upwork & Fiverr Analysis",
    related_skills: []
  },
  {
    project_type: "Mobile App (Cross-Platform)",
    complexity: "high",
    average_price: 50000,
    price_range: { min: 35000, max: 80000 },
    source: "Clutch.co & GoodFirms",
    related_skills: []
  }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for pricing seeding...');

        await PricingBenchmark.deleteMany({});
        console.log('Pricing collection cleared.');

        // Pour chaque entrée, on trouve les skills correspondants
        for (const item of pricingData) {
            if (item.project_type === "Logo Design") {
                const skills = await Skill.find({ name: { $in: ["Logo Design", "Branding", "Color Theory"] } });
                item.related_skills = skills.map(s => s._id);
            } else if (item.project_type === "E-commerce Website") {
                const skills = await Skill.find({ name: { $in: ["React.js", "Node.js", "MongoDB", "UI/UX Design"] } });
                item.related_skills = skills.map(s => s._id);
            } else if (item.project_type === "Mobile App (Cross-Platform)") {
                const skills = await Skill.find({ name: { $in: ["React Native", "Flutter", "UI/UX Design for Mobile", "Firebase"] } });
                item.related_skills = skills.map(s => s._id);
            }
        }

        await PricingBenchmark.insertMany(pricingData);
        console.log(`${pricingData.length} pricing benchmarks seeded successfully!`);

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding pricing:', error);
        process.exit(1);
    }
};

seedDB();