# Job Application Management

Proyek ini adalah sistem manajemen lowongan pekerjaan (Job Portal) yang memfasilitasi dua peran pengguna: **Company (HRD)** dan **Job Seeker (Pencari Kerja)**. Proyek ini dibangun menggunakan arsitektur modern (React + Node.js + Prisma + PostgreSQL) untuk memenuhi kriteria Tech Assessment.

## 📦 Struktur Folder
- `/frontend` - Kode sumber aplikasi antarmuka pengguna (React, Vite, Tailwind CSS, TypeScript)
- `/backend`  - Kode sumber API server (Express.js, Prisma, PostgreSQL, Node.js, TypeScript)

---

## 🚀 Persyaratan Sistem
Sebelum menjalankan aplikasi ini, pastikan Anda telah menginstal:
1. **Node.js** (Versi 18 atau terbaru)
2. **PostgreSQL** (Berjalan di localhost port 5000, atau sesuaikan dengan `.env` Anda)

---

## 🛠️ Cara Menjalankan Aplikasi

### 1. Setup Backend
Buka terminal dan arahkan ke folder `backend`:
```bash
cd backend
```
Install seluruh dependensi:
```bash
npm install
```
Pastikan Anda memiliki database kosong bernama `job_app_management` di PostgreSQL Anda. 
Kemudian, buat dan sinkronisasikan tabel (Database Migration/Schema) dengan perintah:
```bash
npx prisma db push
```
Jalankan server backend:
```bash
npx tsx src/index.ts
```
*(Server akan berjalan di `http://localhost:5001`)*

### 2. Setup Frontend
Buka tab terminal baru dan arahkan ke folder `frontend`:
```bash
cd frontend
```
Install seluruh dependensi:
```bash
npm install
```
Jalankan development server:
```bash
npm run dev
```
Buka browser Anda dan kunjungi tautan yang muncul (biasanya `http://localhost:5173`).

---

## 📚 Dokumentasi API Sederhana

Base URL: `http://localhost:5001/api`

Semua *endpoint* (kecuali Auth) membutuhkan header `Authorization: Bearer <TOKEN>`.

### 1. Authentication (`/auth`)
- `POST /auth/register`
  - **Body**: `{ "email": "tes@mail.com", "password": "123", "name": "Budi", "role": "JOB_SEEKER" | "COMPANY" }`
  - **Deskripsi**: Mendaftarkan pengguna baru.
- `POST /auth/login`
  - **Body**: `{ "email": "tes@mail.com", "password": "123" }`
  - **Deskripsi**: Masuk ke aplikasi dan mendapatkan JWT token.

### 2. Jobs (`/jobs`)
- `POST /jobs`
  - **Role**: `COMPANY`
  - **Body**: `{ "title": "Developer", "description": "...", "location": "Jakarta", "salary": 10000000, "jobType": "FULL_TIME" }`
  - **Deskripsi**: Membuat lowongan pekerjaan baru.
- `GET /jobs`
  - **Role**: `JOB_SEEKER`
  - **Deskripsi**: Mengambil semua daftar lowongan pekerjaan yang tersedia.

### 3. Applications (`/applications`)
- `POST /applications/:jobId`
  - **Role**: `JOB_SEEKER`
  - **Deskripsi**: Mengirimkan lamaran kerja untuk `jobId` tertentu.
- `GET /applications/me`
  - **Role**: `JOB_SEEKER`
  - **Deskripsi**: Melihat semua riwayat lamaran yang pernah dikirim oleh pelamar yang sedang login.
- `GET /applications/company`
  - **Role**: `COMPANY`
  - **Deskripsi**: Melihat semua lamaran masuk untuk lowongan yang dibuat oleh perusahaan tersebut.
- `PATCH /applications/:id/status`
  - **Role**: `COMPANY`
  - **Body**: `{ "status": "REVIEWING" | "ACCEPTED" | "REJECTED" }`
  - **Deskripsi**: Mengubah status lamaran kandidat.

---
**Tech Stack Utama:** React (Vite), Tailwind CSS v4, Node.js, Express, Prisma ORM, PostgreSQL.
