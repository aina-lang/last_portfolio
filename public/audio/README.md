# Sons du portfolio

| Fichier | Rôle |
|---|---|
| `bgm.mp3` | thème joué en boucle, en sourdine, pendant toute la navigation |
| `swoosh.mp3` | souffle déclenché à chaque changement de page |

Remplacez simplement les fichiers pour changer l'ambiance. Si l'un d'eux est
absent, il est remplacé à la volée par une version synthétisée par le
navigateur (nappe + arpège pour le thème, bruit filtré pour le souffle), afin
que le bouton son reste toujours fonctionnel.

Volumes, boucle et atténuation pendant les transitions : `lib/gameAudio.ts`.
