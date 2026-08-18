# Captures d'écran des projets

Déposez ici une image par projet (PNG ou JPG, format paysage 16/10 conseillé,
par exemple 1280×800), puis renseignez son chemin dans `ARCS` — fichier
`app/PortfolioClient.tsx` :

```ts
{ rank: 'S', code: 'SCAN', ..., img: '/projets/scan-colis.png' },
```

Sans `img`, la carte affiche automatiquement la trame manga et le code du projet.

## Captures encore attendues

| Fichier attendu | Projet |
|---|---|
| `scan-colis-accueil.jpg` | Scan Colis — accueil, opérations disponibles |
| `scan-colis-historique.jpg` | Scan Colis — tableau de bord, historique des scans |
| `scan-colis-filtres.jpg` | Scan Colis — filtres type de scan / période |
| `zintra-*.jpg` | Zintra — à déclarer dans `imgs` une fois les captures prêtes |

Tant qu'un fichier manque, la carte et le mockup retombent sur la trame manga
et le code du projet : rien ne casse.
