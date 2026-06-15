$ErrorActionPreference = "Stop"
git reset --soft $(git rev-list --max-parents=0 HEAD)
git reset HEAD
git add backend/config manage.py requirements.txt pyproject.toml .python-version
git commit -m "feat: setup django backend"
git add src/components
git commit -m "feat: add react frontend components"
git add package.json package-lock.json vite.config.ts tsconfig.json
git commit -m "chore: configure vite and dependencies"
git add backend/apps api
git commit -m "feat: integrate database models and api"
git add vercel.json vercel_deploy.md supabase_deploy.md .vercel
git commit -m "ci: add vercel and supabase deployment config"
git add public assets media static
git commit -m "style: add ui assets and styling"
git add .
git commit -m "fix: final adjustments for deployment"
