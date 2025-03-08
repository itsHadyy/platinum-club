import { initializeApp } from "firebase/app";
import { getAuth, browserLocalPersistence, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAQXnpcCwk1hqwooHvMlMawy86ow_I3jNo",
    authDomain: "platinum-club-ec943.firebaseapp.com",
    databaseURL: "https://platinum-club-ec943-default-rtdb.firebaseio.com",
    projectId: "platinum-club-ec943",
    storageBucket: "platinum-club-ec943.firebasestorage.app",
    messagingSenderId: "551630434877",
    appId: "1:551630434877:web:48e66ec301efe8d1753054",
    measurementId: "G-2PQ469LLY1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Ensure user stays logged in even after refresh or app restart
setPersistence(auth, browserLocalPersistence)
    .then(() => {
        console.log("✅ Auth persistence enabled (local)");
    })
    .catch((error) => {
        console.error("❌ Error enabling auth persistence:", error);
    });

export { auth, db, storage };