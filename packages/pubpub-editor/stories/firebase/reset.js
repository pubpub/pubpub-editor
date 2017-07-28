import basicDoc from './basicTestDoc1';
import firebase from 'firebase';
import firebaseConfig from './firebaseConfig';

const reset = () => {
  const firebaseApp = firebase.initializeApp(firebaseConfig, "reset");
  const db = firebase.database(firebaseApp);
  // const ref = db.ref('/');

  return db.ref().remove().then(() => {
    return db.ref('basicDoc').set(basicDoc);
  });
}

export default reset;
