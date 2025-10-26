import Skill from '../models/skill.models.js';

export const getAllSkills = async (req, res) => {
    try {
        console.log("✅ [API] /api/skills called. Attempting to fetch skills...");
        const skills = await Skill.find({});
        console.log(`✅ [API] Found ${skills.length} skills. Sending to frontend.`);
        res.status(200).json(skills);
    } catch (error) {
        console.error("❌ [API] Error fetching skills:", error); // L'error l'khat'a
        res.status(500).json({ message: 'Erreur lors de la récupération des compétences.' });
    }
};