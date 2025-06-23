<H1>CAREER LAUNCH BEURS – WEBAPPLICATIE</H1>

<H2>📌 PROJECTBESCHRIJVING</H2>

Deze webapplicatie is ontwikkeld voor de Career Launch beurs aan de Erasmushogeschool Brussel, als einwerk voor het vak Programming Project. Onze website brengt studenten en bedrijven digitaal samen en laat hen via een Tinder-achtig systeem communiceren. Studenten kunnen bedrijven bekijken, een gesprek aanvragen, en indien beide partijen akkoord gaan, volgt een match met locatie-informatie van de beursstand. De applicatie stimuleert werkgelegenheid en investeert tegelijk in de reputatie van de school.

<H2> Project openen in VSCode </H2>

1. Clone de repository en ga naar de map:  
   ```bash
   git clone https://github.com/WouterOnGithub/Programming-project.git
   cd frontend
2. ```bash
   npm install

3. ```bash
   npm run dev

<H2> 🎯 FUNCTIONALITEITEN </H2>

<H3> 🔐 LOGIN- EN REGISTRATIEPAGINA</H3>

- studenten en bedrijven kunnen zich veilig aanmelden of registreren
- Firebase Authentication met Google Sign-in
- Rol-gebaseerde toegang (Student, Bedrijf)
- Wachtwoord reset functionaliteit

*Voor admin, ga naar 

http://localhost:5173/admin

login-gegevens
 
mail: admin@test.be 
wachtwoord: test123

<H3> 👤 PROFIEL </H3>

**Voor Studenten:**
- Persoonlijke informatie (naam, geboortedatum, email)
- Vaardigheden en competenties
- CV upload (optioneel)
- Werkervaring
- Profielfoto
- Type job gezocht (stage, job, vakantiejob)
- Beschikbaarheid tijdens beurs

**Voor Bedrijven:**
- Bedrijfsinformatie (naam, sector, grootte)
- "About us" beschrijving
- Locatie en contactgegevens
- Jobtypes aangeboden (stage, job, vakantiejob)
- Verwachtingen en vereisten
- Bedrijfslogo
- LinkedIn profiel

<H3> 📄 PROFIEL PREVIEW</H3>

Kleine preview met de belangrijkste informatie uit het volledige profiel.

- **Voor studenten/werknemers:** Bedrijfspagina's bevatten 'About us', locatie, jobtype, verwachtingen en favorieten functionaliteit
- **Voor bedrijven:** Studentpagina's bevatten naam, geboortedatum, vaardigheden, korte voorstelling en jobtype gezocht

<H3> 💬 MATCHING EN NOTIFICATIES</H3>

- **Swipe-systeem:** Studenten kunnen bedrijven liken om een gesprek aan te vragen en wordt weergegeven per job die je het meest representeert
- **Match notificaties:** Real-time notificaties bij matches
- **Locatie informatie:** Automatische notificatie met beursstand locatie bij match
- **Gesprek planning:** Mogelijkheid om afspraken in te plannen

<H3> 📍 BEURSLOCATIE (bron nog af te wachten)</H3>

- **Interactieve kaart:** Leaflet.js implementatie voor beurslocatie
- **Grondplan weergave:** Visuele weergave van beursstands
- **Locatie tracking:** Real-time locatie van bedrijven op beurs

<H3> FOOTER </H3>

- over ons
- contactgegevens
- social-media
- copyrightregel

<H3> 🗓️ BEURSINFO</H3>

- **Datum:** Vrijdag 13 maart 2026
- **Locatie:** Nijverheidskaai 170, 1070 Anderlecht
- **Tijden:** 10:00 - 16:00
- **Dagplanning:** Gedetailleerd programma
- **Deelnemende bedrijven:** Overzicht van alle bedrijven

<H3> 👨‍💼 ADMIN PANEL</H3>

- **Gebruikersbeheer:** Studenten en bedrijven beheren
- **Verificatie:** Bedrijfsverificatie systeem
- **Grondplan beheer:** Beurslocatie configuratie
- **Matches overzicht:** Alle matches en afspraken
- **Statistieken:** Beurs statistieken en rapporten

<H2> 🛠️ TECHNOLOGIEËN</H2>

Frontend: HTML, CSS, JavaScript (-> Vue.js)

Backend: - **Firebase** - Backend-as-a-Service
  - **Firestore** - NoSQL database
  - **Authentication** - User management
  - **Storage** - File storage
  - **Hosting** - Web hosting

Database: Firebase firestore,
          collections:  
  - `student` - Student profielen
  - `bedrijf` - Bedrijfsprofielen
  - `admin` - Admin gebruikers
  - `notifications` - Notificaties
  - `grondplannen` - Beurslocatie data
  - `companyLocations` - Bedrijfslocaties op beurs
  - `locationNames` - Array met herbruikbare standlocaties
  - `rejectionComments` - Commentaar bij een door admin afgewezen bedrijf
  - `studentenvoorkeur` - Lijst van wat interessant is voor bedrijf
  - `swipes`- Matches tussen studenten en bedrijven
 
       
<H2> 👨‍💻 TEAM</H2>
- Azaoum Rania
- Dang Enwin
- Eddouks Yassine
- Parvaiz Hassan
- Tassnim Papleux
- Wouter Van Den Bossche
- Imad Ben Ali

<H2> 📆 DEADLINE</H2>

Het project moet afgewerkt en gepresenteerd worden tegen het einde van het semester (23/06/2025).

<H2> DOCUMENTATIE</H2>

![ERD-papier](https://github.com/user-attachments/assets/e394f730-ecb6-40fd-8983-eccfc35bf5f3)

<H2> 🔗 BRONNEN</H2>
- ChatGPT

- Cursor AI

- Manus AI

- W3Schools.com. (s. d.). https://www.w3schools.com/

- Traversy Media. (2024, 1 juillet). Vue.js crash course [Vidéo]. YouTube. https://www.youtube.com/watch?v=VeNfHj6MhgA

