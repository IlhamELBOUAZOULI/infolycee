# InfoLycée — dossier de déploiement

## Contenu
- `public/index.html` : page **professeur** (connexion + création de compte professeur uniquement)
- `public/eleve.html` : page **élève** (connexion + création de compte élève uniquement)
- `server.js` : serveur Node.js (aucune dépendance) qui sert les pages et stocke les données communes
- `data/` : créé automatiquement (comptes, ressources, fichiers). **À sauvegarder régulièrement.**

## Contrôles
À la fin de chaque module, après la dernière séquence, une section **Contrôles** est affichée. Le professeur y ajoute des contrôles sous forme de fichiers `.html` autonomes (CSS et JavaScript inclus dans le fichier). L'élève les ouvre dans la page (sans bouton Télécharger).

## Adresses
- Professeur : `https://votre-site/`  (garder ce lien pour vous)
- Élèves : `https://votre-site/eleve`  (seul lien à donner aux élèves)

## Lancer en local
    node server.js        (Node.js 18 ou plus)
Puis ouvrir http://localhost:3000 (professeur) et http://localhost:3000/eleve (élève).

## Code d'inscription professeur
Pour qu'un élève ne puisse pas se créer un compte professeur, la création d'un compte professeur demande un code.
- Le définir : variable d'environnement `TEACHER_CODE=votre-code`
- Sinon un code est généré au premier démarrage : il s'affiche dans les journaux du serveur et reste dans `data/teacher-code.txt`.

## Déployer en ligne (exemples)
Il faut un hébergeur **Node.js** avec **HTTPS** (obligatoire : le chiffrement des mots de passe ne fonctionne pas en http simple) et un **disque persistant**.
- Commande de démarrage : `npm start`
- Variables : `TEACHER_CODE` (conseillé), `DATA_DIR` = dossier du disque persistant (ex. `/var/data`), `PORT` (fourni par l'hébergeur)
- Render / Railway / Fly.io : créer un service Web depuis ce dossier, ajouter un volume/disque, y pointer `DATA_DIR`.
  Sans disque persistant, les comptes et les cours sont perdus à chaque redémarrage (cas des offres gratuites sans disque).
- VPS : `node server.js` derrière Nginx/Caddy avec certificat HTTPS, lancé par pm2 ou systemd.

## Limites à connaître
Les comptes sont vérifiés dans le navigateur (principe de l'application d'origine). C'est adapté à une classe, mais ce n'est pas un système sécurisé contre un élève qui connaît le fonctionnement technique. Pour des données sensibles, il faudra passer à une authentification côté serveur.
