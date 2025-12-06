import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from keras.models import Sequential
from keras.layers import Conv1D, MaxPooling1D, Flatten, Dense, Embedding, Dropout, Input
from keras.utils import to_categorical
from keras_preprocessing.text import Tokenizer
from keras_preprocessing.sequence import pad_sequences
import pickle
from cnx_MongoDb import connect_to_db


print("--- CHARGEMENT ---")
db, collection = connect_to_db()
cursor = collection.find({}, {"_id": 0, "sequence": 1, "class_label": 1})
df = pd.DataFrame(list(cursor))

print(f"Données chargées : {len(df)}")
print(df['class_label'].value_counts())


df['seq_spaced'] = df['sequence'].apply(lambda x: " ".join(list(x)))

tokenizer = Tokenizer(char_level=False)
tokenizer.fit_on_texts(df['seq_spaced'])
X_sequences = tokenizer.texts_to_sequences(df['seq_spaced'])

MAX_LEN = 100 # On a découpé en morceaux de 100
X_padded = pad_sequences(X_sequences, maxlen=MAX_LEN, padding='post')

# 2 classes (Humain vs Chimp)
y = to_categorical(df['class_label'].values, num_classes=2)

X_train, X_test, y_train, y_test = train_test_split(X_padded, y, test_size=0.20, random_state=42)


# --- CNN OPTIMISÉ (VERSION PROFONDE) ---
print("\nConstruction du modèle CNN V2 (Deep)...")
vocab_size = len(tokenizer.word_index) + 1 

model = Sequential()

# 1. On définit l'entrée
model.add(Input(shape=(MAX_LEN,)))

# 2. Embedding plus riche (16 dimensions au lieu de 8)
# Pour capter plus de nuances chimiques entre A, T, C, G
model.add(Embedding(input_dim=vocab_size, output_dim=16))

# 3. Premier étage de Convolution (Détails fins)
model.add(Conv1D(filters=64, kernel_size=8, activation='relu'))
model.add(MaxPooling1D(pool_size=2))

# 4. Deuxième étage de Convolution (Combinaisons de motifs)
# C'est souvent cette couche qui fait la différence !
model.add(Conv1D(filters=128, kernel_size=4, activation='relu'))
model.add(MaxPooling1D(pool_size=2))

# 5. Troisième étage (Optionnel mais puissant)
model.add(Conv1D(filters=64, kernel_size=4, activation='relu'))
model.add(MaxPooling1D(pool_size=2))

# 6. Décision
model.add(Flatten())
model.add(Dense(64, activation='relu'))
model.add(Dropout(0.3)) # On garde un peu de Dropout pour éviter le par cœur
model.add(Dense(2, activation='softmax'))

# On réduit un peu le learning rate pour qu'il apprenne plus finement
from keras.optimizers import Adam
opt = Adam(learning_rate=0.0005) # Vitesse d'apprentissage plus douce

model.compile(optimizer=opt, loss='categorical_crossentropy', metrics=['accuracy'])
model.summary()

# --- ENTRAÎNEMENT (Plus long) ---
# On augmente les epochs car on apprend plus doucement
history = model.fit(X_train, y_train, epochs=30, batch_size=32, validation_data=(X_test, y_test))
loss, acc = model.evaluate(X_test, y_test)
print(f"\n🏆 ACCURACY MITOCHONDRIAL : {acc * 100:.2f}%")
model.save('modele_dna_mt_97.keras') 
print("✅ Modèle sauvegardé sous 'modele_dna_mt_97.keras'")

# 2. Sauvegarder le Tokenizer (Le traducteur)
# C'est INDISPENSABLE pour traduire les nouvelles séquences exactement comme l'entraînement
with open('tokenizer.pickle', 'wb') as handle:
    pickle.dump(tokenizer, handle, protocol=pickle.HIGHEST_PROTOCOL)
print("✅ Tokenizer sauvegardé sous 'tokenizer.pickle'")