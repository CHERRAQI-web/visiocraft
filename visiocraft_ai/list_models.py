import os
import google.generativeai as genai
from dotenv import load_dotenv

# 1. Charger le fichier .env explicitement
load_dotenv()

# 2. Récupérer la clé et vérifier si elle existe
api_key = os.environ.get("GOOGLE_API_KEY")

if not api_key:
    print("ERREUR: La variable d'environnement 'GOOGLE_API_KEY' n'est pas définie.")
    print("Veuillez vérifier que votre fichier '.env' existe dans ce dossier et contient la ligne:")
    print("GOOGLE_API_KEY=votre_clé_ici")
else:
    print("Clé API trouvée. Recherche des modèles...")
    try:
        genai.configure(api_key=api_key)
        print("\nModèles disponibles pour 'generateContent':")
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(m.name)
    except Exception as e:
        print(f"Une erreur est survenue: {e}")
