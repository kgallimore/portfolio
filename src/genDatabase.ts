import { initializeApp, applicationDefault } from "firebase-admin/app";
import { firebaseConfig } from "./config/firebase";
import { projects } from "./projectsImport";
import { getFirestore } from "firebase-admin/firestore";

// TODO: make this executable.
const app = initializeApp({
  credential: applicationDefault(),
  databaseURL: firebaseConfig.databaseURL,
});

const firestore = getFirestore(app);

const cleanArray = projects.map((project) => project.title.replace(/[^a-zA-Z0-9]/g, ""));

firestore.doc("projects/settings").set({ list: cleanArray });
