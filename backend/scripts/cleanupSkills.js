import mongoose from 'mongoose';
import Skill from '../models/skill.models.js';
import Freelancer from '../models/freelancer.models.js';
import Project from '../models/project.models.js';
import dotenv from 'dotenv';

dotenv.config();

// --- DÉFINIR LES RÈGLES DE NETTOYAGE ---
// Clé: Le nom incorrect à supprimer
// Valeur: Le nom correct à conserver
const SKILL_MERGE_MAP = {
    "React": "React.js",
    "UI/UX": "UI/UX Design",
    "MongoDB": "MongoDB", // On le garde, juste pour l'exemple
    "E-commerce": "Web Development" // On corrige "E-commerce" vers "Web Development"
};

const cleanupSkills = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for cleanup...');

        for (const [incorrectName, correctName] of Object.entries(SKILL_MERGE_MAP)) {
            console.log(`\nProcessing merge for: "${incorrectName}" -> "${correctName}"`);

            // 1. Trouver les deux compétences
            const incorrectSkill = await Skill.findOne({ name: incorrectName });
            const correctSkill = await Skill.findOne({ name: correctName });

            if (!incorrectSkill) {
                console.log(`-> Incorrect skill "${incorrectName}" not found. Skipping.`);
                continue;
            }
            if (!correctSkill) {
                console.log(`-> Correct skill "${correctName}" not found. Skipping.`);
                continue;
            }
            
            const incorrectId = incorrectSkill._id;
            const correctId = correctSkill._id;

            // 2. Mettre à jour tous les freelancers qui utilisent l'ID incorrect
            const freelancerUpdateResult = await Freelancer.updateMany(
                { skills: incorrectId },
                { $pull: { skills: incorrectId }, $addToSet: { skills: correctId } }
            );
            console.log(`-> Updated ${freelancerUpdateResult.modifiedCount} freelancers.`);

            // 3. Mettre à jour tous les projets qui utilisent l'ID incorrect
            const projectUpdateResult = await Project.updateMany(
                { extracted_skills: incorrectId },
                { $pull: { extracted_skills: incorrectId }, $addToSet: { extracted_skills: correctId } }
            );
            console.log(`-> Updated ${projectUpdateResult.modifiedCount} projects.`);

            // 4. Supprimer la compétence incorrecte
            await Skill.findByIdAndDelete(incorrectId);
            console.log(`-> Deleted incorrect skill "${incorrectName}".`);
        }

        console.log('\n✅ Cleanup completed successfully!');
        await mongoose.connection.close();

    } catch (error) {
        console.error('Error during cleanup:', error);
        process.exit(1);
    }
};

cleanupSkills();