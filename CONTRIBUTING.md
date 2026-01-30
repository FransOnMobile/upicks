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

We use a **Shared Remote Supabase Project**. This means everyone connects to the same database.

*   **Data**: If you add a user or a rating, everyone else will see it immediately because we are all reading from the same cloud database.
*   **Schema Changes (Migrations)**:
    If you need to change the database structure (e.g., add a column), you must create a migration:
    
    1.  Make sure you have Supabase CLI installed.
    2.  Run `supabase migration new your_migration_name`.
    3.  Add your SQL to the new file in `supabase/migrations/`.
    4.  Apply it to the remote database:
        ```bash
        supabase db push
        ```
    5.  **Commit the migration file** to Git so others get the schema update!

### 4. Code Style & Linting
*   We use Next.js with TypeScript.
*   Run `npm run typecheck` to verify types.
*   Run `npm run lint` before committing.

Happy coding!
