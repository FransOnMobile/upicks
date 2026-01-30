# Contributing to UPicks

We love your input! We want to make contributing to this project as easy and transparent as possible.

## 🚀 Collaborative Development Workflow

We use **GitHub** for version control and **Supabase** for our backend. To ensure everyone is in sync, please follow these guidelines.

### 1. Setting Up Your Environment
Every collaborator needs the same environment configuration to connect to the shared database.

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/upicks.git
    cd upicks
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    You need to create a `.env.local` file with the shared project credentials. Ask the project lead for these keys if you don't have them.
    
    ```bash
    cp .env.example .env.local
    ```
    
    Update `.env.local`:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-shared-anon-key
    ```
    **Important:** Do NOT commit `.env.local` to Git. This file is ignored by `.gitignore`.

### 2. Real-time Collaboration & Git Workflow

Git is a distributed version control system. Changes are **not** immediately reflected on other people's machines. You must **Push** your changes and others must **Pull** them.

#### How to stay in sync:
1.  **Before starting work**, always pull the latest changes:
    ```bash
    git pull origin main
    ```
2.  **Create a new branch** for your feature (don't work directly on `main`):
    ```bash
    git checkout -b feature/my-new-feature
    ```
3.  **Commit often**:
    ```bash
    git add .
    git commit -m "Added a new rating component"
    ```
4.  **Push your changes**:
    ```bash
    git push origin feature/my-new-feature
    ```
5.  **Open a Pull Request** on GitHub when you are ready to merge.

#### For Real-Time "Pair Programming":
If you want to edit code simultaneously with a teammate (like Google Docs), Git is not the tool. Instead, use the **VS Code Live Share** extension.

1.  Install [Live Share Extension](https://marketplace.visualstudio.com/items?itemName=MS-vsliveshare.vsliveshare).
2.  Click "Live Share" in the status bar.
3.  Send the link to your collaborator.
4.  You can now edit the *same* files in real-time.

### 3. Database Changes (Supabase)

We use a **Shared Remote Supabase Project**. To keep the database in sync with our code, we use **Automated Migrations** via GitHub Actions.

#### How to apply schema changes:
1.  **Develop Locally**: Create a migration using the Supabase CLI (optional, if you have it installed).
    ```bash
    supabase migration new description_of_change
    ```
2.  **Write SQL**: Add your SQL to the new file in `supabase/migrations/`.
3.  **Push to GitHub**:
    *   Simply commit the new `.sql` file and push to `main`.
    *   The **GitHub Action** will automatically run `supabase db push` and apply the changes to the shared live database.

> [!IMPORTANT]
> **For the Repository Admin:**
> You must configure these **GitHub Secrets** for the automation to work:
> 1.  `SUPABASE_PROJECT_ID`: Your project's reference ID (found in Project Settings > General).
> 2.  `SUPABASE_DB_PASSWORD`: The database password you set when creating the project.

#### Manual Fix (If Automation is not set up)
If you see errors like `Could not find column ... in schema cache`, it means the database is behind. You can manually run the SQL in the **Supabase Dashboard**:
1.  Go to the [Supabase Dashboard](https://supabase.com/dashboard).
2.  Open the **SQL Editor**.
3.  Copy the content of the pending migration file (e.g., `supabase/migrations/20260130_add_data_moderation.sql`).
4.  Run it.

### 4. Code Style & Linting
*   We use Next.js with TypeScript.
*   Run `npm run typecheck` to verify types.
*   Run `npm run lint` before committing.

Happy coding!
