# QLAND Bot — Guide de configuration

## 🚀 Déploiement sur Railway

1. Va sur [railway.app](https://railway.app) et crée un nouveau projet
2. Sélectionne **"Deploy from GitHub repo"** ou **"Empty project"**
3. Upload les fichiers ou connecte ton repo GitHub
4. Dans l'onglet **Variables**, ajoute :
   - `TOKEN` = ton token de bot Discord

## ⚙️ Configuration Discord (IMPORTANT)

### 1. Permissions du bot
Le bot a besoin des permissions suivantes :
- `Manage Roles` (pour donner le rôle vérifié)
- `Send Messages`
- `View Channels`
- `Read Message History`
- `Use Application Commands`

> ⚠️ Le rôle du bot doit être **au-dessus** du rôle `1512416266990780606` dans la hiérarchie des rôles.

### 2. Configuration des permissions de salon

#### Channel de vérification (`#verification`, ID: 1512416583136579694)
Ce salon doit être visible SEULEMENT par les membres non vérifiés.

**@everyone** :
- ✅ Voir le salon
- ✅ Lire les messages
- ❌ Envoyer des messages

**Rôle Vérifié** (`1512416266990780606`) :
- ❌ Voir le salon (override négatif)

#### Tous les autres salons
**@everyone** :
- ❌ Voir le salon

**Rôle Vérifié** (`1512416266990780606`) :
- ✅ Voir le salon

### 3. Lancer le panel de vérification
Une fois le bot en ligne, tape dans n'importe quel salon :
```
&setup
```
Cela enverra le bouton de vérification dans le salon `1512461738753392750`.

## 📋 Commandes

| Commande | Description | Permission |
|----------|-------------|------------|
| `&help` | Affiche l'aide | Tous |
| `&ping` | Latence du bot | Tous |
| `&info` | Infos du bot | Tous |
| `&setup` | Envoie le panel de vérif | Admin |

## 🔄 Flux de vérification

1. Nouveau membre arrive → voit seulement `#verification`
2. Il clique sur **"Accepter & Accéder au serveur"**
3. Le bot lui donne le rôle `1512416266990780606`
4. Le rôle masque `#verification` et débloque tous les autres salons
