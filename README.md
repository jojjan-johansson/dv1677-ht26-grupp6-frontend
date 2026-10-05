# dv1677-ht26-grupp6-frontend

## Gruppmedlemmar

| Namn | GitHub |
|------|--------|
| Johanna Johansson | @jojjan-johansson |
| Rebecka Corell    | @beckabeckis      |

## Om projektet

Frontend för grupp 6:s bokningssystem i kursen DV1677. Frontenden byggs med React och Vite och kommer att kommunicera med gruppens backend-API.

## Kör lokalt

```bash
git clone https://github.com/jojjan-johansson/dv1677-ht26-grupp6-frontend.git
cd dv1677-ht26-grupp6-frontend
cp .env.example .env
npm install
npm run dev
```

**Miljövariabler** (se .env.example):

| Variabel | Beskrivning |
|----------|-------------|
| VITE_API_URL | URL till backend-API:t |

## Bygga för produktion

```bash
npm run build
```

## Driftsatt

- Frontend: [https://jojjan-johansson.github.io/dv1677-ht26-grupp6-frontend/](https://jojjan-johansson.github.io/dv1677-ht26-grupp6-frontend/)
- Backend: [https://dv1677-geordi.nplab.bth.se/](https://dv1677-geordi.nplab.bth.se/)

## Tillvägagångssätt

Dokumentera löpande vad ni gjort och hur ni löst problem.

- Vecka 3: Vi började med att skapa en ren grundsida med React och Vite, skapade en .env fil och la sedan in .env i .gitignore

- Vecka 4: Vi migrerade backend från SQLite till MongoDB och anpassade resurser och bokningar till MongoDB. Backend gjordes om till ett JSON-API och frontend kopplades till API:t för att hämta och visa resurser. Vi lade även till API-tester med Vitest, Supertest och MongoDB Memory Server och delade upp app och server för att testerna skulle kunna köras utan att starta webbservern.

- Vecka 5: Vi containeriserade backend och MongoDB med Docker och driftsatte backend på gruppens VPS. GitHub Actions sattes upp för CI och automatisk deployment via GHCR och SSH. Secrets och deploy key konfigurerades för deployment. Backend publicerades via Caddy med HTTPS. Frontend konfigurerades för GitHub Pages med GitHub Actions och kopplades till den driftsatta backendens API. Routing anpassades för GitHub Pages projektadress.