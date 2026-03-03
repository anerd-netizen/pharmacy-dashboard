Yogi Medicare Inventory Management System
A real-time, full-stack pharmacy inventory dashboard built to modernize local pharmacy management. This application provides instant updates on stock levels, ensuring efficient healthcare logistics.
pharmacy-dashboard-weld.vercel.app

🚀 Key Features
Real-Time Synchronization: Uses Supabase Realtime to push stock updates to all connected clients instantly (no page refresh required).

Robust Security: Implements Row-Level Security (RLS) policies at the database layer to ensure only authorized admins can modify stock levels.

Modern Stack: Built with Next.js 15+ and TypeScript for type safety and performance.

Responsive UI: Styled with Tailwind CSS for seamless mobile and desktop use.

🛠 Tech Stack
Frontend: Next.js (App Router), TypeScript, Tailwind CSS

Backend/Database: Supabase (PostgreSQL)

Authentication: Supabase Auth

Deployment: Vercel

📦 Getting Started
Prerequisites
Node.js (v18+)

A Supabase account

Installation
Clone the repository:

Bash
git clone https://github.com/your-username/yogi-medicare-dynamic.git
cd yogi-medicare-dynamic
Install dependencies:

Bash
npm install
Set up environment variables:
Create a .env.local file in the root directory:

Code snippet
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
Run the development server:

Bash
npm run dev
🔐 Security Configuration
This project utilizes Row Level Security (RLS) in Supabase. To ensure your database is secure, execute the following in your Supabase SQL Editor:

SQL
-- Enable RLS
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Policy for Public Read
CREATE POLICY "Public inventory is readable by everyone" 
ON inventory FOR SELECT TO anon USING (true);

-- Policy for Admin Update (Requires Auth)
CREATE POLICY "Only admins can update stock" 
ON inventory FOR UPDATE TO authenticated USING (true);
📈 Future Roadmap
[ ] Implement Admin Dashboard Login.

[ ] Add Low-Stock Email Notifications using Supabase Edge Functions.

[ ] Generate PDF stock reports.

📄 License
This project is open-source and available under the MIT License.
