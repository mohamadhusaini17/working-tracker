# Working Tracker IA & RM

Dashboard manajemen aktivitas harian tim Internal Audit & Risk Management, dibangun dengan React + Vite + Tailwind CSS.

---

## ✨ Fitur

| Fitur | Keterangan |
|---|---|
| **Sidebar Navigasi** | Team Folder → Tanggal → PIC drill-down |
| **PIC Cards** | Klik tanggal → lihat kartu per-PIC sebelum masuk tabel |
| **Activity Table** | Tambah / edit / hapus aktivitas, sortable semua kolom |
| **Voice Note** | Simulasi speech-to-text pada form aktivitas |
| **Upload Dokumen** | File picker + animasi progress bar + preview konten |
| **Profile & Settings** | Modal berisi statistik real-time & preferensi |
| **Connect by Email** | Simulasi login via email |
| **Edit Mode** | Toggle drag-mode untuk mengatur ulang kartu |
| **Responsive** | Sidebar menjadi hamburger menu di mobile |

---

## 📁 Struktur File

```
working-tracker/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx              ← entry point
    ├── App.jsx               ← root layout (Sidebar + DashboardContent)
    ├── index.css             ← Tailwind + custom dark-navy CSS
    ├── hooks/
    │   └── useIsMobile.js    ← responsive breakpoint hook
    ├── contexts/
    │   └── DashboardContext.jsx  ← global state (teams, activities, PIC)
    ├── constants/
    │   ├── data.js           ← seed data, KATEGORI, TRANSCRIPTS
    │   ├── colors.js         ← PIC palette, badge classes, DOC_META
    │   └── helpers.js        ← cn(), fmtLong(), fmtShort()
    └── components/
        ├── Sidebar.jsx       ← sidebar navigasi
        ├── Header.jsx        ← top bar + user menu
        ├── StatCards.jsx     ← 4 kartu statistik
        ├── ActivityTable.jsx ← tabel aktivitas harian
        ├── PICCard.jsx       ← kartu per-PIC
        ├── ui/               ← komponen primitif (tanpa dependensi eksternal)
        │   ├── Btn.jsx
        │   ├── Card.jsx
        │   ├── DocBtn.jsx
        │   ├── Drop.jsx
        │   ├── IconPicker.jsx
        │   ├── Inp.jsx
        │   ├── Modal.jsx
        │   ├── ProgBar.jsx
        │   ├── Tip.jsx
        │   └── Toast.jsx
        └── modals/
            ├── ActivityForm.jsx
            ├── ConnectEmailModal.jsx
            ├── DelDialog.jsx
            ├── DocPreviewModal.jsx
            ├── FolderModal.jsx
            ├── ProfileModal.jsx
            └── SettingsModal.jsx
```

---

## 🚀 Cara Menjalankan di VS Code

### 1. Clone / buat folder

```bash
# Jika belum ada, buat folder baru:
mkdir working-tracker
cd working-tracker
```

Lalu copy semua file dari zip/repo ke dalam folder tersebut.

### 2. Install dependensi

```bash
npm install
```

> Pastikan **Node.js ≥ 18** terinstal. Cek dengan `node -v`.

### 3. Jalankan development server

```bash
npm run dev
```

Buka browser di **http://localhost:5173**

### 4. Build untuk production

```bash
npm run build
```

Output ada di folder `dist/`.

### 5. Preview hasil build

```bash
npm run preview
```

---

## 🗂 Push ke GitHub

```bash
# 1. Inisialisasi git (jika belum)
git init

# 2. Tambahkan semua file
git add .

# 3. Commit pertama
git commit -m "feat: initial Working Tracker dashboard"

# 4. Buat repo baru di GitHub, lalu hubungkan:
git remote add origin https://github.com/USERNAME/working-tracker.git

# 5. Push
git branch -M main
git push -u origin main
```

> Ganti `USERNAME` dengan username GitHub Anda.

---

## 🛠 Tech Stack

| Library | Versi | Fungsi |
|---|---|---|
| React | 18.3.1 | UI framework |
| Vite | 5.3.1 | Build tool & dev server |
| Tailwind CSS | 3.4.4 | Utility-first styling |
| Lucide React | 0.383.0 | Icon set |

---

## 📝 Menambah Data

Edit file **`src/constants/data.js`** untuk menambah team atau aktivitas awal.

## 🎨 Mengubah Tema Warna

Warna dark navy didefinisikan di **`src/index.css`** dan **`tailwind.config.js`**.
Palette utama:

| Variable CSS | Nilai | Digunakan untuk |
|---|---|---|
| `#080d1a` | Deep navy | Background utama |
| `#060a14` | Darker navy | Sidebar |
| `#0f1629` | Card navy | Card, modal, input |
| `#1e2d4a` | Border | Semua border |
| `#2a3a5c` | Border light | Input border, popup |
