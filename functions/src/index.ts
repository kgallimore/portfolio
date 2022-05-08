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
  .document("clicks/{docID}")
  .onCreate(async (snap) => {
    const data = snap.data() as {
      uid: string;
      timestamp: number;
      type: "views" | "sourceViews" | "linkViews";
      item: string;
    };
    admin
      .firestore(app)
      .doc(`users/${data.uid}/views/${data.item}`)
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
    const after = snap.after.data() as {
      views?: number;
      linkViews?: number;
      sourceViews?: number;
    };

    const before = snap.before.data() as {
      views?: number;
      linkViews?: number;
      sourceViews?: number;
    };
    (
      Object.entries(after) as Array<["views" | "linkViews" | "sourceViews", number]>
    ).forEach(([type, data]) => {
      // If the new data the first view and the old data was not the first view
      if (data === 1 && before[type] !== data) {
        admin
          .database(app)
          .ref("counts/items/" + context.params.item + "/" + type)
          .set(admin.database.ServerValue.increment(1));
      }
    });
  });
