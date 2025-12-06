from pymongo import MongoClient


def connect_to_db():
    client = MongoClient('localhost', 27017)
    db = client ['projet_genomique']
    #choisit la collection equivalent de table dans une base SQL
    collection = db ['sequences_adn']
    print("Connexion a la base de donnees reussie")
    return db,collection