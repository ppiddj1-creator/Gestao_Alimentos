const firebaseConfig = {
  apiKey: "SUBSTITUA_PELA_SUA_API_KEY",
  authDomain: "SUBSTITUA.authDomain.com",
  projectId: "SUBSTITUA_PELO_SEU_PROJECT_ID",
  storageBucket: "SUBSTITUA.storageBucket.com",
  messagingSenderId: "SUBSTITUA_PELO_SEU_SENDER_ID",
  appId: "SUBSTITUA_PELO_SEU_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
