# Google Ads API Setup Guide

Deze guide helpt je stap voor stap bij het opzetten van de Google Ads API integratie.

## Vereiste Environment Variabelen

Je hebt de volgende 5 environment variabelen nodig in je `.env.local` bestand:

```env
GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token_here
GOOGLE_ADS_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_ADS_CLIENT_SECRET=your_client_secret_here
GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token_here
GOOGLE_ADS_CUSTOMER_ID=123-456-7890
```

## Stap-voor-stap Setup

### 1. Developer Token verkrijgen

1. Log in op je [Google Ads Manager account](https://ads.google.com/)
2. Ga naar **Tools & Settings** → **Setup** → **API Center**
3. Klik op **Create Developer Token**
4. Kopieer de token naar `GOOGLE_ADS_DEVELOPER_TOKEN`

### 2. OAuth Credentials (✅ KLAAR)

Je hebt al OAuth credentials aangemaakt in Google Cloud Console:
- **Client ID**: `662177095586-odomcl2bh9imrcqch951o962hodc3ci7.apps.googleusercontent.com`
- **Client Secret**: `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`
- **Redirect URI**: `http://localhost:3000/api/auth/google-ads/callback`

Deze waarden zijn al ingevuld in de code.

### 3. Customer ID vinden

1. Log in op je Google Ads account
2. In de rechterbovenhoek zie je je Customer ID (format: 123-456-7890)
3. Kopieer dit nummer naar `GOOGLE_ADS_CUSTOMER_ID`

### 4. Refresh Token genereren

1. Start je Next.js applicatie: `npm run dev`
2. Ga naar `http://localhost:3000/api/auth/google-ads/callback`
3. Volg de instructies om een authorization URL te krijgen
4. Klik op de URL en geef toestemming
5. Je wordt automatisch doorgeleid naar de callback met je refresh token
6. Kopieer de refresh_token naar `GOOGLE_ADS_REFRESH_TOKEN`

**Of gebruik je bestaande authorization code:**
- Ga naar `http://localhost:3000/api/auth/google-ads/callback?code=YOUR_CODE`

### 5. Connection testen

1. Ga naar `http://localhost:3000/google-ads`
2. Klik op **Test Google Ads Connection**
3. Als alles correct is ingesteld, zie je account informatie

## Veelvoorkomende Problemen

### "Developer token not approved"
- Je developer token moet goedgekeurd worden door Google
- Dit kan enkele dagen duren
- Voor testing kun je een test account gebruiken

### "OAuth consent screen not configured"
- Configureer de OAuth consent screen in Google Cloud Console
- Voeg je eigen email toe als test user tijdens development

### "Invalid customer ID"
- Zorg dat de Customer ID het juiste format heeft (123-456-7890)
- Gebruik het hoofdaccount ID, niet een sub-account

### "Refresh token expired"
- Genereer een nieuwe refresh token via `/api/auth/google-ads/callback`
- Zorg dat `access_type: 'offline'` en `prompt: 'consent'` zijn ingesteld

## Testing

De applicatie bevat een test pagina op `/google-ads` waar je:
- De connectie kunt testen
- Account informatie kunt bekijken
- Error messages kunt zien als er iets mis is

## Verdere Ontwikkeling

Na de basis setup kun je:
- Campaigns ophalen
- Keywords beheren
- Advertenties maken
- Rapportages genereren

Bekijk de [Google Ads API documentatie](https://developers.google.com/google-ads/api/docs/start) voor meer mogelijkheden. 