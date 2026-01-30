# UPicks - Professor Rating System

An interactive platform for rating professors, managing departments, and courses. Built with Next.js 14 and Supabase.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- [Supabase CLI](https://supabase.com/docs/guides/cli) (optional, for local DB)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/upicks.git
cd upicks
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env.local
```
Update `.env.local` with your Supabase credentials.

### 4. Database Setup

#### Option A: Local Development (Recommended)
This will start a local Supabase instance and apply all migrations + seed data automatically.
```bash
supabase start
```
*Note: This requires Docker to be running.*

#### Option B: Hosted Supabase
1.  Create a new project at [database.new](https://database.new).
2.  Link your project:
    ```bash
    supabase link --project-ref your-project-id
    ```
3.  Push the database schema and seed data:
    ```bash
    supabase db push
    ```

### 5. Run the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

## 🛠 Features
- **Rate Professors**: Detailed ratings including difficulty, teaching quality, and optional tags.
- **Moderation System**: Moderators can verify new professors, departments, and courses before they go public.
- **Search & Filter**: Find professors by name, department, or course.
- **Dynamic Content**: Users can submit missing courses and departments for review.

## 🤝 Contributing
Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

1.  Fork the repo
2.  Create your feature branch (`git checkout -b feature/amazing-feature`)
3.  Commit your changes (`git commit -m 'Add some amazing feature'`)
4.  Push to the branch (`git push origin feature/amazing-feature`)
5.  Open a Pull Request
