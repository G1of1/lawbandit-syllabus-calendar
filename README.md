# 📚 AI-Powered Syllabus Scheduler

Effortlessly transform your course syllabus into a **personalized, smart task manager**.  
This app extracts important assignments, exams, and deadlines from your syllabus and turns them into tasks you can **sort, manage, and sync directly with Google Calendar**.  

---

## ✨ Features

✅ **AI Syllabus Parsing** – Upload your syllabus as **PDF or DOCX** and let AI automatically extract tasks and deadlines.  
✅ **Google Calendar Integration** – Sync assignments and exams seamlessly to your calendar.  
✅ **Personal Task Manager** – Save and view your assignments anytime with secure user accounts.  
✅ **Search & Sorting** – Quickly search tasks or sort them by **date** or **name**.  
✅ **Deadline Awareness** – Each task shows:  
- ⏳ Countdown until due date  
- 🎨 Color-coded urgency badges (Overdue 🔴, Urgent 🟡, Safe 🟢)  
✅ **Delete with Confirmation** – Built-in modal ensures you never accidentally remove an assignment.  
✅ **Beautiful Animations** – Smooth transitions powered by **Framer Motion**.  
✅ **Authentication** – Secure sign-in via **Google OAuth (NextAuth)**.  
✅ **Responsive UI** – Optimized for both desktop and mobile.  

---

## 🖼️ Demo Screenshots

<img width="1906" height="891" alt="image" src="https://github.com/user-attachments/assets/004fb3dc-a50c-492e-bb78-bf371f4bdfc9" />
<img width="804" height="799" alt="image" src="https://github.com/user-attachments/assets/9c401533-b774-4f3e-8a71-21810770b753" />
<img width="1616" height="845" alt="image" src="https://github.com/user-attachments/assets/bae3277d-0858-4917-8e7d-56a344e94e89" />


---

## 🚀 Tech Stack

**Frontend**
- [Next.js](https://nextjs.org/) – React framework with App Router  
- [Tailwind CSS](https://tailwindcss.com/) – Modern, utility-first styling  
- [Framer Motion](https://www.framer.com/motion/) – Smooth animations  
- [Lucide React](https://lucide.dev/) – Clean, modern icons  

**Backend / Database**
- [Supabase](https://supabase.com/) – Postgres database with row-level security  
- [NextAuth.js](https://next-auth.js.org/) – Authentication with Google OAuth  

**Other**
- [React Toastify](https://fkhadra.github.io/react-toastify/) – Beautiful toast notifications  
- [Google Calendar API](https://developers.google.com/calendar) – Calendar event syncing  

---

## 💭 Design Decisions and Approach

Every choice in this project was made to balance usability, scalability, and developer experience:

Next.js → Chosen for its hybrid rendering, App Router support, and seamless integration of API routes. This allows frontend and backend logic to coexist in one project.

Supabase → A powerful Postgres backend with built-in auth and RLS. It removes the need for a separate backend server while keeping the flexibility of SQL.

NextAuth (Google OAuth) → Instead of Supabase Auth, NextAuth was chosen for its flexibility and smooth integration with Google’s OAuth client, which was needed for the Google Calendar API.

PDF-Parse and Mammoth → Common and well knowm packages for text extraction between PDFs and DOCX files.

Framer Motion → Animations add delight and improve the user experience. It makes transitions feel smooth and polished.

Toast Notifications → Immediate feedback is crucial when handling uploads, deletions, or sync actions. Toasts were chosen for their non-intrusive yet effective communication style.

Color-coded badges + countdowns → Visual urgency indicators were added to help students instantly understand which deadlines need attention.

Modal Confirmation → Prevents accidental deletions, a common frustration in productivity apps.

Search & Sort → Simple but powerful usability features so students can find assignments fast and organize them however they prefer.

---

