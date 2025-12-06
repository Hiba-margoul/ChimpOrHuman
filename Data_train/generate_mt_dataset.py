import pandas as pd
from cnx_MongoDb import connect_to_db


FILES = {
    'human_mt.txt': {'label': 0, 'name': 'Humain'},
    'chimp_mt.txt': {'label': 1, 'name': 'Chimpanzé'}
}

CHUNK_SIZE = 100 
STRIDE = 10       

def read_clean_fasta(filename):
   
    try:
        with open(filename, 'r') as f:
            lines = f.readlines()
    
        full_seq = ""
        for line in lines:
            line = line.strip()
            if not line.startswith(">"):
                full_seq += line
        
        return full_seq
    except FileNotFoundError:
        print(f" ERREUR : Le fichier {filename} est introuvable !")
        return None

def generate_chunks(sequence, label, organism):
    """Découpe la séquence en morceaux"""
    chunks = []
    # Boucle de découpage
    for i in range(0, len(sequence) - CHUNK_SIZE, STRIDE):
        sub_seq = sequence[i : i + CHUNK_SIZE].upper()
        
        # Validation : On ne veut que du vrai ADN (pas de 'N' ou de lettres bizarres)
        if all(c in 'ATCG' for c in sub_seq):
            chunks.append({
                "sequence": sub_seq,
                "class_label": label,
                "organism": organism
            })
    return chunks

print("--- GÉNÉRATION DU DATASET MITOCHONDRIAL ---")

all_data = []

for filename, info in FILES.items():
    print(f"Traitement de {filename}...")
    seq = read_clean_fasta(filename)
    
    if seq:
        print(f"   -> Longueur totale : {len(seq)} bases")
        new_chunks = generate_chunks(seq, info['label'], info['name'])
        print(f"   -> Échantillons générés : {len(new_chunks)}")
        all_data.extend(new_chunks)

# Insertion MongoDB
if all_data:
    db, collection = connect_to_db()
    
    # NETTOYAGE PRÉALABLE (Important !)
    print("\nVidage de la base existante...")
    collection.delete_many({}) 
    
    print(f"Insertion de {len(all_data)} séquences...")
    collection.insert_many(all_data)
    print(" SUCCÈS ! Base de données prête.")
else:
    print(" Aucune donnée générée.")