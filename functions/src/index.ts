import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const app = admin.initializeApp();

export const newVisitor = functions.auth.user().onCreate(async () => {
  await admin
    .database(app)
    .ref("counts/visitors")
    .set(admin.database.ServerValue.increment(1));
});

export const newClick = functions.firestore
  .document("users/{uid}/clicks/{docID}")
  .onCreate(async (snap, context) => {
    const data = snap.data() as {
      timestamp: number;
      type: "views" | "sourceViews" | "linkViews";
      item: string;
    };
    admin
      .firestore(app)
      .doc(`users/${context.params.uid}/views/${data.item}`)
      .set({ [data.type]: admin.firestore.FieldValue.increment(1) }, { merge: true });
  });
export const newView = functions.firestore
  .document("users/{uid}/views/{item}")
  .onCreate(async (snap, context) => {
    const data = snap.data() as {
      views?: number;
      linkViews?: number;
      sourceViews?: number;
    };

    Object.entries(data).forEach(([type, count]) => {
      if (count === 1) {
        admin
          .database(app)
          .ref("counts/items/" + context.params.item + "/" + type)
          .set(admin.database.ServerValue.increment(1));
      }
    });
  });

export const updateView = functions.firestore
  .document("users/{uid}/views/{item}")
  .onUpdate(async (snap, context) => {
    const data = snap.after.data() as {
      views?: number;
      linkViews?: number;
      sourceViews?: number;
    };

    const before = snap.before.data() as {
      views?: number;
      linkViews?: number;
      sourceViews?: number;
    };

    Object.entries(data).forEach(([type, data]) => {
      const fixTypescript = type[0] as "views" | "linkViews" | "sourceViews";
      if (data === 1 && before[fixTypescript] !== data) {
        admin
          .database(app)
          .ref("counts/items/" + context.params.item + "/" + type)
          .set(admin.database.ServerValue.increment(1));
      }
    });
  });
