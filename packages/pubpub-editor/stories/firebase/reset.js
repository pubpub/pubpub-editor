import basicDoc from './basicTestDoc1';
import firebase from 'firebase';
import firebaseConfig from './firebaseConfig';

const reset = () => {
  const firebaseApp = firebase.initializeApp(firebaseConfig, "reset");
  const db = firebase.database(firebaseApp);
  // const ref = db.ref('/');

  return db.ref().remove().then(() => {
    return db.ref('basicDoc').set(basicDoc).then(() => {
      const forkedDoc = basicDoc;
      forkedDoc.forkData = {
        forkedKey: 231,
        merged: false,
        parent: "basicDoc",
      };
      return db.ref('basicDoc01').set(forkedDoc);
    });
  });
}

export default reset;
