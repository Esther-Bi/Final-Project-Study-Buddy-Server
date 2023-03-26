import { initializeApp } from 'firebase/app';
import * as fb from 'firebase/firestore'
import 'firebase/auth';
import 'firebase/firestore'
import { FieldValue } from 'firebase/firestore';


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


export async function updateStudentDetails(uid, name, year, degree, gender, age, phone) {
    const studentsRef = fb.doc(db, 'students', uid)
    const userDoc = await fb.getDoc(studentsRef)
    if(userDoc.exists()){
        await fb.updateDoc(studentsRef, {name: name})
        await fb.updateDoc(studentsRef, {year: year})
        await fb.updateDoc(studentsRef, {degree: degree})
        await fb.updateDoc(studentsRef, {gender: gender})
        await fb.updateDoc(studentsRef, {age: age})
        await fb.updateDoc(studentsRef, {phone: phone})
        return "done"
    }
    else{
        console.log("error")
    }
}