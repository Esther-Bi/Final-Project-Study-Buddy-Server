import { initializeApp } from 'firebase/app';
import * as fb from 'firebase/firestore'
import 'firebase/auth';
import 'firebase/firestore'
import { where } from 'firebase/firestore';


//connect to firebase
const firebaseConfig = {
    apiKey: "AIzaSyA8gK69clEXFHPBgvmYE71gvDp_5VMlC8A",
    authDomain: "studybuddy-d48ac.firebaseapp.com",
    databaseURL: "https://studybuddy.firebaseio.com",
    projectId: "studybuddy-d48ac"
    // storageBucket: "<BUCKET>.appspot.com",
    // messagingSenderId: "<SENDER_ID>",
  };

const fireBaseRef = initializeApp(firebaseConfig);
const db = fb.getFirestore(fireBaseRef);