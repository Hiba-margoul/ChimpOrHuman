import numpy as np
import pickle
import re 
from flask import Flask, request, jsonify
from flask_cors import CORS
from keras.models import load_model
from keras_preprocessing.sequence import pad_sequences

app = Flask(__name__)
CORS(app)

# CONFIGURATION
MAX_LEN = 100 
CLASSES = ['Humain', 'Chimpanzé']

print("Chargement du modèle...")
model = load_model('modele_dna_mt_97.keras') 

with open('tokenizer.pickle', 'rb') as handle:
    tokenizer = pickle.load(handle)

def predict_sliding_window(sequence, window_size=100, stride=50):
    """
    Découpe une longue séquence en morceaux, prédit sur chaque morceau,
    et fait la moyenne des scores (Vote).
    """
    chunks = []
    for i in range(0, len(sequence) - window_size + 1, stride):
        chunk = sequence[i : i + window_size]
        chunks.append(chunk)
    
  
    if len(chunks) == 0:
        chunks = [sequence]

    # 2. Préparation (Tokenization + Padding) pour TOUS les morceaux
    chunks_spaced = [" ".join(list(c)) for c in chunks]
    chunks_tokenized = tokenizer.texts_to_sequences(chunks_spaced)
    chunks_padded = pad_sequences(chunks_tokenized, maxlen=MAX_LEN, padding='post', truncating='post')

    # 3. Prédiction de masse (Batch prediction)
    predictions = model.predict(chunks_padded, verbose=0)

    # 4. Moyenne des scores (Le Vote)
    avg_scores = np.mean(predictions, axis=0)
    return avg_scores

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    raw_input = data.get('sequence', '')

    if not raw_input:
        return jsonify({'error': 'Séquence vide'}), 400

    try:
        # --- NETTOYAGE DRASTIQUE ---
        # 1. Enlever les headers FASTA (la ligne qui commence par >)
        if ">" in raw_input:
            raw_input = "".join([line.strip() for line in raw_input.split('\n') if not line.startswith(">")])
        
        # 2. Tout en majuscule
        upper_input = raw_input.upper()

        # 3. Enlever TOUT ce qui n'est pas A, T, C, G (Espaces, N, sauts de ligne...)
        clean_seq = re.sub(r'[^ATCG]', '', upper_input)

        if len(clean_seq) < 10:
            return jsonify({'error': 'Séquence invalide ou trop courte (Pas d\'ADN détecté)'}), 400

        # --- PRÉDICTION PAR VOTE ---
        # On utilise la fonction de fenêtre glissante
        avg_prediction = predict_sliding_window(clean_seq)
        
        # Récupération des scores moyens
        score_humain = float(avg_prediction[0])
        score_chimp = float(avg_prediction[1])
       
        
        class_id = np.argmax(avg_prediction)
        confidence = float(np.max(avg_prediction))

        return jsonify({
            'label': CLASSES[class_id],
            'confidence': confidence,
            'scores': {
                'humain': score_humain,
                'chimp': score_chimp,
                
            },
            'debug_info': f"Analysé sur {len(clean_seq)} bases."
        })

    except Exception as e:
        print(f"Erreur Back: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)