import requests

api_url = "http://localhost:8080/login"  # Sostituisci <indirizzo_del_tuo_api> con l'URL corretto del tuo API
username = "jonny"
password = "password"

session = requests.Session()
session.auth = (username, password)


url = 'http://localhost:8080/users'  # Sostituisci con l'URL corretto dell'API per creare utenti

# Dati dell'utente da inviare
payload = {
    'username': "jonny",
    'mail': "jonny@jonny.com",
    'password': "password",
    'assignedTables': [1,2,3,4],
    'role' : 'WAITER'
}

try:
    response = requests.post(url, json=payload)
    if response.status_code == 201:
        print('Utente creato con successo!')
    else:
        print('Errore durante la creazione dell\'utente. Codice di stato:', response.status_code)
except requests.exceptions.RequestException as e:
    print('Errore di connessione:', str(e))




try:
    response = session.get(api_url)
    
    if response.status_code == 200:
        token = response.json().get("token")
        if token:
            print("Login effettuato con successo!")
            print("Token:", token)
            session.auth = None
            
            # Esegui altre richieste utilizzando il token come autorizzazione
            headers = {"Authorization": f"Bearer {token}"}
            # Esempio di richiesta GET con token nell'header
            protected_url = "http://localhost:8080/waiters"
            response = session.get(protected_url, headers=headers)
            print(response.text)

            url = "http://localhost:8080/waiters/648c9194c191c456a7d05f9a/tables/99"
            response = session.put(url, headers=headers)
            print(response.text)
            url = "http://localhost:8080/waiters/648c9194c191c456a7d05f9a/tables/3"
            response = session.delete(url, headers=headers)
            print(response.text)

            if response.status_code == 200:
                print("Richiesta al protected endpoint riuscita!")
                # Puoi gestire la risposta come desideri
            else:
                print("Errore durante la richiesta al protected endpoint. Codice di stato:", response.status_code)
            
        else:
            print("Errore: il token non è stato fornito nella risposta.")
    else:
        print("Errore durante il login. Codice di stato:", response.status_code)
    
except requests.exceptions.RequestException as e:
    print("Errore durante la connessione all'API:", str(e))
