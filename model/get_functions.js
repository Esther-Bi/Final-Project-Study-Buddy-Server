import { initializeApp } from 'firebase/app';
import * as fb from 'firebase/firestore'
import 'firebase/auth';
import 'firebase/firestore'
import { where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'


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

export const auth = getAuth(fireBaseRef)

export async function getStudentDetails(uid) {
    console.log(uid)
    const studentsRef = fb.doc(db, 'students', uid)
    const userDoc = await fb.getDoc(studentsRef)
    if(userDoc.exists()){
        const {name, age, year, degree, phone} = userDoc.data()
        return {name, age, year, degree, phone}
    } else{
      console.log("error")
    }
    return null
  }

  export async function getTeacherDetails(uid) {
    console.log(uid)
    const teachersRef = fb.doc(db, 'teachers', uid)
    const userDoc = await fb.getDoc(teachersRef)
    if(userDoc.exists()){
        const {name, age, year, degree} = userDoc.data()
        return {name, age, year, degree}
    } else{
      console.log("error")
    }
    return null
  }

  export async function getFilteredTeachers(course, date, from, to) {
    
    //An array that will contain all the teachers match the filter
    const filteredTeachers = []
    //creat list contain all teachers from fierbais
    const teacherSnapshot = await fb.getDocs(fb.collection(db, 'teachers'))
    const teacherListFromDB = teacherSnapshot.docs || []
    const teacherList = teacherListFromDB.map(doc=> {
      const {name, id, courses, dates, grades, prices} = doc.data()
      return {name, id, courses, dates, grades, prices}
      
    })

    //Translates the hours entered in the filter into numbers
    var fromNum
    var toNum
    if (from == "choose from hour"){
      fromNum = -1
    }
    else{
      fromNum = parseInt(from.split(":")[0])
    }
    if (to == "choose to hour"){
      toNum = -1
    }
    else{
      toNum = parseInt(to.split(":")[0])
    }

    //run on all teachers
    teacherList.forEach((teacher) => {
      //flag for each parameter: course, date, time
      var flagC = 0
      var flagD = 0
      var flagT = 0

      //run on all courses of this teacher
      const courseList = teacher.courses
        courseList.forEach((c) => {
          //if this is the course in the filter or did not enter a course
          if (c == course || course == "choose course"){
            flagC = 1
          }
        });

      //run on all dates of this teacher
      const datesList = teacher.dates
        datesList.forEach((d) => {
          //if this is the data in the filter or did not enter a date
          if (d.includes(date) || date == "choose date"){
            flagD = 1
          }
          const hourNum = parseInt(d.split(" - ")[1].split(":")[0])
          if (hourNum >= fromNum && hourNum <= toNum){
            flagT = 1
          }
          if (fromNum == -1 && toNum == -1){
            flagT = 1
          }
          if (hourNum >= fromNum && toNum == -1){
            flagT = 1
          }
          if (fromNum == -1 && hourNum <= toNum){
            flagT = 1
          }
        });

      //if this teacher match the filter in all parameters
      if ( flagC == 1 && flagD == 1 && flagT == 1){
        filteredTeachers.push(teacher)
      }
    });
    return filteredTeachers;  
  }

  export async function getAllTeachers() {
    
    //creat list contain all teachers from fierbais
    const teacherSnapshot = await fb.getDocs(fb.collection(db, 'teachers'))
    const teacherListFromDB = teacherSnapshot.docs || []
    const teacherList = teacherListFromDB.map(doc=> {
      const {name, id, courses, dates, grades, prices} = doc.data()
      return {name, id, courses, dates, grades, prices}
    })
    return teacherList
  }

  //click on approve payment
  export async function approvePayment(uid, teacherName, date, subject) {
    
    //find the current class 
    const q = fb.query(fb.collection(db, 'classes'), fb.where("student", "==", uid), fb.where("teacherName", "==", teacherName), fb.where("subject", "==", subject), fb.where("date", "==", date));
    const snapshot = await fb.getDocs(q);
    const classListFromDB = snapshot.docs || []
    const classList = classListFromDB.map(doc=> {
        //get class id
        const {studentApproval} = doc.data()
        return {studentApproval}
    })
    return classList[0].studentApproval
  
  }

  export async function getTeacherCourses(uid) {
    console.log(uid)
    const teachersRef = fb.doc(db, 'teachers', uid)
    const userDoc = await fb.getDoc(teachersRef)
    if(userDoc.exists()){
        const courses = userDoc.data().courses || []
        return courses
    } else{
      console.log("error")
    }
    return null
  }
  
  export async function getTeacherGrades(uid) {
    console.log(uid)
    const teachersRef = fb.doc(db, 'teachers', uid)
    const userDoc = await fb.getDoc(teachersRef)
    if(userDoc.exists()){
        const grades = userDoc.data().grades || []
        return grades
    } else{
      console.log("error")
    }
    return null
  }
  
  export async function getTeacherDates(uid) {
    console.log(uid)
    const teachersRef = fb.doc(db, 'teachers', uid)
    const userDoc = await fb.getDoc(teachersRef)
    if(userDoc.exists()){
        const dates = userDoc.data().dates || []
        return dates
    } else{
      console.log("error")
    }
    return null
  }
  
  export async function getStudentMobileNumber(uid, name, subject, date) {
    const q = fb.query(fb.collection(db, 'classes'), fb.where("teacher", "==", uid), fb.where("studentName", "==", name), fb.where("subject", "==", subject), fb.where("date", "==", date));
    const snapshot = await fb.getDocs(q);
    const classListFromDB = snapshot.docs || []
    const classList = classListFromDB.map(doc=> {
      const {student} = doc.data()
      return {student}
    })
  
    const studentID = classList[0].student
    console.log(studentID)
    const studentsRef = fb.doc(db, 'students', studentID)
    const userDoc = await fb.getDoc(studentsRef)
    if(userDoc.exists()){
        const phone = userDoc.data().phone
        return phone
    } else{
      console.log("error")
    }
    return null
  }
  
  export async function getClassQuery(uid) {
    const q = fb.query(fb.collection(db, 'classes'), fb.where("teacher", "==", uid));
    const snapshot = await fb.getDocs(q);
    const classListFromDB = snapshot.docs || []
    const classList = classListFromDB.map(doc=> {
      const {teacher} = doc.data()
      console.log(doc.data())
      return {teacher}
    })
  
    return snapshot
  
    //return q
  }
  
  export async function getTeacherMobileNumber(uid, name, subject, date) {
    console.log("bla bla:" + uid);
    const auth = getAuth(fireBaseRef)
    console.log(auth.currentUser);
    // if (fireBaseRef.auth.currentUser !== null) 
    //       console.log("user id: " + fireBaseRef.auth.currentUser.uid);
    const q = fb.query(fb.collection(db, 'classes'), fb.where("student", "==", uid), fb.where("teacherName", "==", name), fb.where("subject", "==", subject), fb.where("date", "==", date));
    const snapshot = await fb.getDocs(q);
    const classListFromDB = snapshot.docs || []
    const classList = classListFromDB.map(doc=> {
      const {teacher} = doc.data()
      return {teacher}
    })
  
    const teacherID = classList[0].teacher
    const teachersRef = fb.doc(db, 'teachers', teacherID)
    const userDoc = await fb.getDoc(teachersRef)
    if(userDoc.exists()){
        const phone = userDoc.data().phone
        return phone
    } else{
      console.log("error")
    }
    return null
  }