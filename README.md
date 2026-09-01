# Famille — app de gestion familiale

Calendrier partagé, garde de votre fille, événements spéciaux, documents, notes et contacts. Next.js + Supabase.

## Mise en route (Supabase)

L'app a besoin d'un projet Supabase gratuit pour fonctionner (comptes, base de données, stockage des documents).

1. Créer un compte et un projet sur [supabase.com](https://supabase.com) (gratuit).
2. Dans le projet Supabase, ouvrir **SQL Editor** → coller le contenu de [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) → exécuter. Cela crée toutes les tables, les règles de sécurité (RLS) et le bucket de stockage `family-documents`.
   Puis faire de même avec [`supabase/migrations/0002_child_and_family.sql`](supabase/migrations/0002_child_and_family.sql) (fiche enfant, dépenses, tâches, suivi mensuel).
3. Dans **Project Settings → API**, copier :
   - `Project URL`
   - `anon public` key
4. Copier `.env.local.example` vers `.env.local` et renseigner ces deux valeurs :
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
5. Lancer l'app :
   ```bash
   npm run dev
   ```
6. Ouvrir [http://localhost:3000](http://localhost:3000) → créer un compte (ex. "Maman"), puis un deuxième compte (ex. "Papa") depuis un autre navigateur/onglet privé.
7. Aller dans **Garde** pour configurer le motif d'alternance (qui commence, tous les combien de jours).

## Fonctionnalités

- **Calendrier** — événements + bandes de garde colorées par jour, jours fériés canadiens importables en un clic (page Tableau de bord)
- **Garde** — motif d'alternance récurrent + exceptions ponctuelles (ex. un souper, un échange de jour)
- **Fiche enfant** — infos essentielles, santé, école et activités, vêtements/effets, transferts, communication, et répartition des tâches ("qui s'occupe de quoi") entre les deux parents
- **Dépenses partagées** — suivi des dépenses, qui a payé, remboursement, solde calculé automatiquement selon un pourcentage de partage configurable
- **Suivi mensuel** — checklist "à ne pas oublier" par catégorie (école, santé, vêtements, social, activités, administratif), avec notes libres, remise à zéro chaque mois
- **Documents** — téléversement, catégories, recherche, prévisualisation, stockage privé (Supabase Storage)
- **Notes partagées** — petite liste de rappels/tâches communs
- **Contacts** — école, pédiatre, urgences…

## Déploiement (accès depuis vos téléphones)

Une fois testé en local, déployez gratuitement sur [Vercel](https://vercel.com) :

1. Poussez le code sur un dépôt GitHub.
2. Importez le dépôt dans Vercel, ajoutez les deux variables d'environnement (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) dans les réglages du projet Vercel.
3. Déployez — l'app sera accessible depuis un lien `https://...vercel.app` sur tous vos appareils.

## Stack technique

Next.js (App Router) + TypeScript + Tailwind CSS + Supabase (Postgres, Auth, Storage).
