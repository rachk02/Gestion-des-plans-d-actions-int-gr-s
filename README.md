# @ctPro

**@ctPro** est une plateforme web collaborative de gestion et de suivi des réunions, actions et processus PDCA (Plan–Do–Check–Act). Conçue pour structurer et tracer chaque étape de vos projets, elle offre une interface intuitive et modulable pour piloter vos activités, garantir la responsabilisation des acteurs et produire des analyses de performance en temps réel.

---

## Table des matières

1. [Fonctionnalités clés](#fonctionnalités-clés)  
2. [Architecture et technologies](#architecture-et-technologies)  
3. [Prérequis](#prérequis)  
4. [Installation et configuration](#installation-et-configuration)  
5. [Modèle de données](#modèle-de-données)  
6. [Utilisation](#utilisation)  
7. [Personnalisation & Extensibilité](#personnalisation--extensibilité)  
8. [Contribuer](#contribuer)  
9. [Licence](#licence)  
10. [Contact](#contact)  

---

## 1. Fonctionnalités clés

- **Planification de réunions**  
  - Création de rencontres (réunions, audits, ateliers)  
  - Invitation automatisée des participants  
  - Rappels de convocation (e‑mail, notifications internes)  

- **Comptes‑rendus intégrés**  
  - Rédaction et archivage des CR avec pièces jointes  
  - Indexation et recherche plein‑texte  

- **Gestion des actions (PDCA)**  
  - Proposition et assignment d’actions ou délibérations  
  - Workflow complet : acceptation, exécution, vérification, approbation, clôture  
  - Suivi des sous‑actions et report d’échéances  

- **Administration et sécurité**  
  - Profils et rôles hiérarchiques (SuperAdmin, Admin, Initiateur, Responsable, Vérificateur, Approbateur, Rapporteur)  
  - Gestion centralisée des utilisateurs, groupes et entités  
  - Contrôle d’accès granulaire et journaux d’audit  

- **Paramétrage avancé**  
  - Types de rencontres, actions et messages personnalisables  
  - Priorités, codes couleurs, modèles de documents  
  - Structure organisationnelle et activités clés par entité  

- **Tableaux de bord & KPIs**  
  - Indicateurs en temps réel : actions en retard, taux de réactivité, charge par entité  
  - Graphiques interactifs  

- **API RESTful & Intégrations**  
  - Points d’entrée pour automatisation et synchronisation  
  - Webhooks pour notifier des services tiers  

---

## 2. Architecture et technologies

- **Backend**  
  - Langage : Python 3.9+  
  - Framework : Django 4.x  
  - ORM : Django ORM  
  - Authentification : Django REST Framework + JWT  
  - Tests : pytest / Django Test Suite  

- **Frontend**  
  - Framework : Vue.js 3  
  - Routing : Vue Router  
  - State : Vuex ou Pinia  
  - UI : Vuetify (ou Bootstrap Vue)  

- **Base de données**  
  - MySQL 8+ (ou MariaDB 10.5+)  

- **Infrastructure**  
  - Conteneurs : Docker & Docker Compose  
  - CI/CD : GitHub Actions ou GitLab CI  

- **Modélisation**  
  - Diagrammes UML générés en Mermaid / PlantUML  
  - Modélisation MCD / MLD avec PowerDesigner  

---

## 3. Prérequis

- Docker & Docker Compose  
- Python 3.9+ et pip  
- Node.js 16+ et npm/yarn  
- Git  
- Serveur MySQL 8+ (ou MariaDB 10.5+)  
- Serveur SMTP pour notifications e‑mail (optionnel)  

---

## 4. Installation et configuration

1. **Cloner le dépôt**  
   
   ```bash
   git clone https://github.com/votre-organisation/ctPro.git
   cd ctPro
   
1. **Configurer les variables d’environnement**
    Copiez et éditez les fichiers d’exemple :

   ```bash
   cp backend/.env.example backend/.env
   # Dans backend/.env :
   # DATABASE_URL=mysql://ctpro:secret@db:3306/ctpro
   # SECRET_KEY=votre_secret_django
   # EMAIL_HOST=smtp.example.com
   # ...
   cp frontend/.env.example frontend/.env
   # Dans frontend/.env :
   # VUE_APP_API_URL=http://localhost:8000/api
   ```

2. **Démarrer les services**

   ```bash
   docker-compose up -d
   ```

3. **Initialiser la base de données**

   ```bash
   docker-compose exec backend python manage.py migrate
   docker-compose exec backend python manage.py loaddata initial_data.json
   ```

4. **Installer les dépendances frontend**

   ```bash
   cd frontend
   npm install    # ou yarn install
   npm run build  # ou yarn build
   cd ..
   ```

5. **Accéder à l’application**

   - Backend API : `http://localhost:8000/api/`
   - Frontend Web : `http://localhost:8080/`

------

## 5. Modèle de données

Le modèle relationnel comprend les principales entités :

- **PERSONNEL** (base de l’utilisateur)
- **UTILISATEUR**, **PROFIL**, **GROUPE**, **ENTITE**
- **RENCONTRE**, **COMPTE_RENDU**, **TYPE_RENCONTRE**
- **ACTION**, **SOUS_ACTION**, **TYPE_ACTION**, **PRIORITE_ACTION**
- **TYPE_MESSAGE**, **ACTIVITE_CLE**

Voir **docs/dictionnaire_des_données.md** et **docs/mcd_ctpro.mmd** pour le détail du dictionnaire et du MCD.

------

## 6. Utilisation

1. **Créer un compte**
   - Inscription via l’interface ou provisionnement par un Admin.
2. **Planifier une réunion**
   - Menu → Rencontres → Nouvelle rencontre → renseignez sujet, date, lieu, participants.
3. **Rédiger un compte‑rendu**
   - Dans la liste des rencontres → bouton “CR” → saisissez le contenu et joignez vos fichiers.
4. **Gérer les actions PDCA**
   - Menu → Actions → Nouvelle action → choisissez type, priorité, responsable, échéance.
5. **Suivi et reporting**
   - Menu → Tableau de bord → consultez vos KPIs et graphiques.

------

## 7. Personnalisation & Extensibilité

- Tous les **diagrammes UML** (Mermaid & PlantUML) se trouvent dans **docs/uml/**.
- **Plugins** & **extensions** via l’API Django REST Framework.
- **Thèmes** Vue.js : personnalisez les composants SCSS dans **frontend/src/styles/**.

------

## 8. Contribuer

1. Forkez le projet
2. Créez une branche (`git checkout -b feature/ma-fonctionnalité`)
3. Codez et ajoutez des tests (`pytest` pour le backend, `vue-cli-service test` pour le frontend)
4. Ouvrez une Pull Request en suivant le guide de contribution (`CONTRIBUTING.md`)
