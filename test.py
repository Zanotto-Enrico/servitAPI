import requests
import json

# Definisci il payload da inviare
payload = {
  
    "name": "uova",
    "price": 100,
    "preparationTime": 12,
    "description": "uova di gallina",
    "category": "dessert"
}

# Converte il payload in JSON
payload_json = json.dumps(payload)

# URL dell'endpoint POST
url = "http://localhost:8080/courses"

# Invia la richiesta POST con il payload JSON
response = requests.post(url, data=payload_json, headers={"Content-Type": "application/json"})

# Controlla lo stato della risposta
if response.status_code == 200:
    print("Richiesta inviata con successo.")
else:
    print("Si è verificato un errore durante l'invio della richiesta. Codice di stato:", response.status_code)

