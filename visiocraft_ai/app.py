# app.py
import os
import json
from flask import Flask, request, jsonify
from dotenv import load_dotenv
import google.generativeai as genai

# 1. Charger les variables d'environnement depuis le fichier .env
load_dotenv()

# 2. Initialisation de l'application Flask
app = Flask(__name__)

# 3. Configuration de Google Gemini
# On récupère la clé API depuis le fichier .env
try:
    genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))
    model = genai.GenerativeModel('models/gemini-2.5-flash')
except Exception as e:
    print(f"Erreur lors de la configuration de Google AI: {e}")
    print("Assurez-vous d'avoir défini la variable d'environnement 'GOOGLE_API_KEY'.")
    model = None

# 4. La fonction qui communique avec Google Gemini
def extract_skills_from_text(project_details):
    """
    Extrait les compétences d'un texte en utilisant l'API Google Gemini.
    """
    if not model:
        print("Le modèle Gemini n'est pas initialisé.")
        return []

    if not project_details or not isinstance(project_details, str):
        return []

    # On combine les instructions "system" et "user" en un seul prompt pour Gemini
    prompt = f"""
    You are an expert assistant for identifying technical and creative skills.
    Your only task is to extract a list of distinct skills from the project description provided below.
    Focus on specific technologies (e.g., React.js, Node.js, MongoDB), design concepts (e.g., UI/UX, Minimalism), and industry-specific terms.
    
    **Project Description:**
    "{project_details}"
    
    **Instructions:**
    - Analyze the description above.
    - Return ONLY a valid JSON object.
    - The JSON object must have a single key named "skills".
    - The value of "skills" must be an array of strings, where each string is a distinct skill.
    - Do not add any explanations, introductory text, or markdown formatting like ```json.
    
    Example of correct output: {{"skills": ["React.js", "UI/UX Design", "MongoDB"]}}
    """

    try:
        response = model.generate_content(prompt)
        
        # La réponse de Gemini peut parfois inclure des caractères indésirables, on nettoie
        response_text = response.text.strip()
        
        # On essaie de parser le JSON
        parsed_response = json.loads(response_text)
        skills = parsed_response.get("skills", [])
        
        # On s'assure que c'est bien une liste
        if isinstance(skills, list):
            return skills
        else:
            print("L'IA n'a pas retourné une liste de compétences.")
            return []

    except json.JSONDecodeError:
        print(f"Erreur de décodage JSON. Réponse de l'IA: {response.text}")
        return []
    except Exception as e:
        print(f"Erreur lors de l'appel à l'API Gemini: {e}")
        return []

# 5. L'endpoint (l'URL) que ton backend Node.js va appeler
@app.route('/extract-skills', methods=['POST'])
def handle_skill_extraction():
    """
    Endpoint API pour recevoir les détails du projet et retourner les compétences.
    """
    if not model:
        return jsonify({"error": "Le service AI n'est pas disponible. Vérifiez la configuration de l'API."}), 503

    data = request.get_json()
    
    if not data or 'project_details' not in data:
        return jsonify({"error": "Missing 'project_details' in request body"}), 400

    project_details = data['project_details']
    extracted_skills = extract_skills_from_text(project_details)
    
    return jsonify({"skills": extracted_skills})

# Point d'entrée pour lancer le serveur
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
