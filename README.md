# 📌 Platinum Club - Quasar Firebase App

A **Quasar Framework** + **Firebase** application with authentication, role-based access, and a clean layout structure for authenticated and unauthenticated users.

---

## 📂 Project Structure
```
/src
  ├── /layouts
  │   ├── AuthLayout.vue  # Layout for unauthenticated users (Login/Register)
  │   ├── MainLayout.vue  # Layout for authenticated users (Dashboard, etc.)
  │
  ├── /pages
  │   ├── /auth
  │   │   ├── LoginPage.vue
  │   │   ├── RegisterPage.vue
  │   │   ├── LandingPage.vue
  │   │   ├── PendingApproval.vue
  │   ├── /authed
  │   │   ├── HomePage.vue
  │   │   ├── UserDashboard.vue
  │   │   ├── AmenitiesPage.vue
  │   ├── AdminPanel.vue
  │   ├── ErrorNotFound.vue
  │
  ├── /stores
  │   ├── useAuthStore.js   # Pinia store for authentication
  │
  ├── routes.js  # Routing setup
  ├── main.js    # App entry file
```

---

## 🛠 Features
✅ **Authentication** - Users can log in and register using Firebase Auth.  
✅ **Role-Based Access** - Redirect users based on roles (Admin, User, Pending).  
✅ **Firebase Firestore** - Stores user information and roles.  
✅ **Layouts** - Separate layouts for authenticated and unauthenticated users.  
✅ **Quasar Components** - Beautiful UI using Quasar Framework.  

---

## 🚀 Getting Started
### 1️⃣ Install Dependencies
```sh
npm install
```

### 2️⃣ Setup Firebase
1. Go to [Firebase Console](https://console.firebase.google.com/).  
2. Create a new project and enable:
   - Authentication (Email/Password)
   - Firestore Database  
3. Copy your Firebase credentials into `.env` file:
```sh
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3️⃣ Run the App
```sh
quasar dev
```

---

## 🔑 Authentication & Routing
| Role  | Redirects To  |
|--------|-------------|
| **User**  | `/dashboard` |
| **Admin** | `/admin` |
| **Pending** | `/auth/pending` |

- `useAuthStore.js` manages authentication state.  
- Firebase Firestore stores user roles.  

---

## 📜 API & Firebase
This app uses:
- **Firebase Authentication** for login/signup.
- **Firestore Database** to store user roles.
- **Pinia Store** (`useAuthStore.js`) to manage state.

---

## 🌍 Deployment
To build for production:
```sh
quasar build
```

---

## 📧 Contact
If you have any questions or issues, feel free to reach out! 🚀
