import Client from '../models/client.models.js';
import Project from '../models/project.models.js';
import Freelancer from '../models/freelancer.models.js';

export const getDashboardStats = async (req, res) => {
    try {
        // --- Statistiques globales ---
        // On utilise Promise.all pour exécuter les comptages en parallèle et optimiser le temps de réponse
        const [totalClients, totalProjects, totalFreelancers] = await Promise.all([
            Client.countDocuments(),
            Project.countDocuments(),
            Freelancer.countDocuments()
        ]);

        // --- NOUVEAU : Compte des projets urgents ---
        // On définit la date limite pour "urgent" (dans 3 jours à partir de maintenant)
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        threeDaysFromNow.setHours(23, 59, 59, 999); // On considère la fin de la journée

        const urgentProjects = await Project.countDocuments({
            deadline_date: { $lte: threeDaysFromNow },
            // On ne compte que les projets qui ne sont pas déjà terminés ou annulés
            status: { $nin: ['completed', 'cancelled'] } 
        });

        // --- NOUVEAU : Compte des projets par statut ---
        // On utilise une agrégation pour compter efficacement tous les projets regroupés par statut
        const statusCountsAggregation = await Project.aggregate([
            {
                $group: {
                    _id: '$status', // Grouper par le champ 'status'
                    count: { $sum: 1 } // Compter le nombre de documents dans chaque groupe
                }
            }
        ]);

        // On transforme le résultat de l'agrégation (un tableau) en un objet plus facile à utiliser
        // Exemple : [{ _id: 'in_progress', count: 5 }, { _id: 'pending', count: 10 }]
        // Devient : { in_progress: 5, pending: 10 }
        const statusCounts = statusCountsAggregation.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});


        // --- Réponse JSON avec toutes les statistiques ---
        res.status(200).json({
            totalClients,
            totalProjects,
            totalFreelancers,
            urgentProjects, // Le nombre de projets urgents
            statusCounts    // L'objet contenant le décompte pour chaque statut
        });

    } catch (error) {
        console.error("Erreur lors de la récupération des statistiques:", error);
        res.status(500).json({ message: "Erreur serveur interne." });
    }
};