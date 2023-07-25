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
    const studentsRef = fb.doc(db, 'students', uid)
    const userDoc = await fb.getDoc(studentsRef)
    if(userDoc.exists()){
        const {name, age, year, degree, gender, phone} = userDoc.data()
        return {name, age, year, degree, gender, phone}
    } else{
      console.log("error")
    }
    return null
  }

export async function getTeacherDetails(uid) {
  const teachersRef = fb.doc(db, 'teachers', uid)
  const userDoc = await fb.getDoc(teachersRef)
  if(userDoc.exists()){
    const {id, name, courses, prices, dates, grades, age, year, degree, gender, phone, payBox, rating} = userDoc.data()
    return {id, name, courses, prices, dates, grades, age, year, degree, gender, phone, payBox, rating}
  } else{
    console.log("error")
  }
  return null
}

export async function getFilteredTeachers(course, date, from, to, sortId) {
  
  //An array that will contain all the teachers match the filter
  const filteredTeachers = []
  const num_cours = -1;
  //creat list contain all teachers from fierbais
  const teacherSnapshot = await fb.getDocs(fb.collection(db, 'teachers'))
  const teacherListFromDB = teacherSnapshot.docs || []
  const teacherList = teacherListFromDB.map(doc=> {
    const {id, name, courses, prices, dates, grades, degree, age, gender, year, rating} = doc.data()
    return {id, name, courses, prices, dates, grades, degree, age, gender, year, rating}
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

  if (sortId == "grade"){
    filteredTeachers.sort((a, b) => {
      var intA = -1
      var intB = -1
      var x =-1
      const courseListA = a.courses
      courseListA.forEach((c) => {
        //if this is the course in the filter or did not enter a course
        x++
        if (c == course){
          intA = x
        }
      });
      x =-1
      const courseListB = b.courses
      courseListB.forEach((c) => {
        //if this is the course in the filter or did not enter a course
        x++
        if (c == course){
          intB = x
        }
      });
      if (a.grades[intA] > b.grades[intB]) {
        return -1;
      }
      if (a.grades[intA] < b.grades[intB]) {
        return 1;
      }    
      return 0;
    });
  }
  if (sortId == "price"){
    filteredTeachers.sort((a, b) => {
      var intA = -1
      var intB = -1
      var x =-1
      const courseLista = a.courses
      courseLista.forEach((c) => {
        //if this is the course in the filter or did not enter a course
        x++
        if (c == course){
          intA = x
        }
      });
      x =-1
      const courseListb = b.courses
      courseListb.forEach((c) => {
        //if this is the course in the filter or did not enter a course
        x++
        if (c == course){
          intB = x
        }
      });
      if (a.prices[intA] < b.prices[intB]) {
        return -1;
      }
      if (a.prices[intA] > b.prices[intB]) {
        return 1;
      }    
      return 0;
    });
  }

  return filteredTeachers;  
}

export async function getAllTeachers() {
  
  //creat list contain all teachers from fierbais
  const teacherSnapshot = await fb.getDocs(fb.collection(db, 'teachers'))
  const teacherListFromDB = teacherSnapshot.docs || []
  const teacherList = teacherListFromDB.map(doc=> {
    const {id, name, courses, prices, dates, grades, degree, age, gender, year, rating} = doc.data()
    return {id, name, courses, prices, dates, grades, degree, age, gender, year, rating}
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

export async function getMyGroups(uid) {
  
  //An array that will contain all my groups
  const myGroups = []
  //creat list contain all groups
  const groupsSnapshot = await fb.getDocs(fb.collection(db, 'groups'))
  const groupsListFromDB = groupsSnapshot.docs || []
  const groupsList = groupsListFromDB.map(doc=> {
    const {participants, subject, day, time, id, min_participants} = doc.data()
    return {participants, subject, day, time, id, min_participants}
    
  })
  
  //run on all groups
  groupsList.forEach((group) => {

    if (group.participants.length >= group.min_participants){
      //run on all participants of this group
      const participantsList = group.participants
      
      participantsList.forEach((p) => {
          //if this is the course in the filter or did not enter a course
          if (p == uid){
            myGroups.push(group)
          }
        });
      }
  });
  return myGroups;  
}

export async function payBoxLink(uid, teacherName, subject, date) {
  const q = fb.query(fb.collection(db, 'classes'), fb.where("student", "==", uid), fb.where("teacherName", "==", teacherName), fb.where("subject", "==", subject), fb.where("date", "==", date));
  const snapshot = await fb.getDocs(q);
  const classListFromDB = snapshot.docs || []
  const classList = classListFromDB.map(doc=> {
    const {teacher} = doc.data()
    return {teacher}
  })

  const teacherID = classList[0].teacher
  const teachersRef = fb.doc(db, 'teachers', teacherID)
  const userDoc = await fb.getDoc(teachersRef)
  if (userDoc.exists()){
      const payBox = userDoc.data().payBox
      return payBox
  } else{
    console.log("error")
  }
  return null
}

  //click on approve payment
  export async function approvePaymentTeacher(uid, studentName, date, subject) {
  
  //find the current class 
  const q = fb.query(fb.collection(db, 'classes'), fb.where("teacher", "==", uid), fb.where("studentName", "==", studentName), fb.where("subject", "==", subject), fb.where("date", "==", date));
  const snapshot = await fb.getDocs(q);
  const classListFromDB = snapshot.docs || []
  const classList = classListFromDB.map(doc=> {
      //get class id
      const {studentApproval} = doc.data()
      return {studentApproval}
  })
  return classList[0].studentApproval

}

export async function getMyClassesStudent(uid) {
  
  const filteredClasses = []
  //creat list contain all teachers from fierbais
  const classSnapshot = await fb.getDocs(fb.collection(db, 'classes'))
  const classListFromDB = classSnapshot.docs || []
  const classList = classListFromDB.map(doc=> {
    const {student, teacher, studentName, teacherName, cost, date, subject} = doc.data()
    return {student, teacher, studentName, teacherName, cost, date, subject}
  })

  classList.forEach((c) => {      
    if (c.student == uid){
      var classDate = c.date;

      const dateParts = classDate.split(' ');
      const month = dateParts[0];
      const day = dateParts[1];
      const year = dateParts[2];
      const time = dateParts[4];
      const dateTimeString = `${month} ${day}, ${year} ${time}`;
      
      const date_class = new Date(dateTimeString);

      const today = new Date();
      const date_today = new Date(today);

      if (date_today < date_class) {
        filteredClasses.push(c)
      }
    }
  });
  filteredClasses.sort(function(a, b) {
    const dateParts1 = a.date.split(' ');
    const month1 = dateParts1[0];
    const day1 = dateParts1[1];
    const year1 = dateParts1[2];
    const time1 = dateParts1[4];
    const dateTimeString1 = `${month1} ${day1}, ${year1} ${time1}`;
    const date_class1 = new Date(dateTimeString1);

    const dateParts2 = b.date.split(' ');
    const month2 = dateParts2[0];
    const day2 = dateParts2[1];
    const year2 = dateParts2[2];
    const time2 = dateParts2[4];
    const dateTimeString2 = `${month2} ${day2}, ${year2} ${time2}`;
    
    const date_class2 = new Date(dateTimeString2);
    return date_class1 - date_class2
  })
  return filteredClasses;  
}

export async function getMyClasses(uid) {
  
  const filteredClasses = []
  //creat list contain all teachers from fierbais
  const classSnapshot = await fb.getDocs(fb.collection(db, 'classes'))
  const classListFromDB = classSnapshot.docs || []
  const classList = classListFromDB.map(doc=> {
    const {student, teacher, studentName, teacherName, cost, date, subject} = doc.data()
    return {student, teacher, studentName, teacherName, cost, date, subject}
  })

  classList.forEach((c) => {      
    if (c.teacher == uid){
      var classDate = c.date;

      const dateParts = classDate.split(' ');
      const month = dateParts[0];
      const day = dateParts[1];
      const year = dateParts[2];
      const time = dateParts[4];
      const dateTimeString = `${month} ${day}, ${year} ${time}`;
      
      const date_class = new Date(dateTimeString);

      const today = new Date();
      const date_today = new Date(today);

      if (date_today < date_class) {
        filteredClasses.push(c)
      }
    }
  });

  filteredClasses.sort(function(a, b) {
    const dateParts1 = a.date.split(' ');
    const month1 = dateParts1[0];
    const day1 = dateParts1[1];
    const year1 = dateParts1[2];
    const time1 = dateParts1[4];
    const dateTimeString1 = `${month1} ${day1}, ${year1} ${time1}`;
    const date_class1 = new Date(dateTimeString1);

    const dateParts2 = b.date.split(' ');
    const month2 = dateParts2[0];
    const day2 = dateParts2[1];
    const year2 = dateParts2[2];
    const time2 = dateParts2[4];
    const dateTimeString2 = `${month2} ${day2}, ${year2} ${time2}`;
    
    const date_class2 = new Date(dateTimeString2);
    return date_class1 - date_class2
  })
  return filteredClasses;  
}

export async function getClassPayments(uid) {
  
  const filteredClasses = []
  //creat list contain all teachers from fierbais
  const classSnapshot = await fb.getDocs(fb.collection(db, 'classes'))
  const classListFromDB = classSnapshot.docs || []
  const classList = classListFromDB.map(doc=> {
    const {student, teacher, studentName, teacherName, cost, date, subject} = doc.data()
    return {student, teacher, studentName, teacherName, cost, date, subject}
  })

  classList.forEach((c) => {      
    if (c.teacher == uid){
      
      var classDate = c.date;

      const dateParts = classDate.split(' ');
      const month = dateParts[0];
      const day = dateParts[1];
      const year = dateParts[2];
      const time = dateParts[4];
      const dateTimeString = `${month} ${day}, ${year} ${time}`;
      
      const date_class = new Date(dateTimeString);

      const today = new Date();
      const date_today = new Date(today);

      if (date_today > date_class) {
        filteredClasses.push(c)
    }
  }});
  filteredClasses.sort(function(a, b) {
    const dateParts1 = a.date.split(' ');
    const month1 = dateParts1[0];
    const day1 = dateParts1[1];
    const year1 = dateParts1[2];
    const time1 = dateParts1[4];
    const dateTimeString1 = `${month1} ${day1}, ${year1} ${time1}`;
    const date_class1 = new Date(dateTimeString1);

    const dateParts2 = b.date.split(' ');
    const month2 = dateParts2[0];
    const day2 = dateParts2[1];
    const year2 = dateParts2[2];
    const time2 = dateParts2[4];
    const dateTimeString2 = `${month2} ${day2}, ${year2} ${time2}`;
    
    const date_class2 = new Date(dateTimeString2);
    return date_class1 - date_class2
  })
  return filteredClasses;  
}


export async function getClassPaymentsStudent(uid) {
  
  const filteredClasses = []
  //creat list contain all teachers from fierbais
  const classSnapshot = await fb.getDocs(fb.collection(db, 'classes'))
  const classListFromDB = classSnapshot.docs || []
  const classList = classListFromDB.map(doc=> {
    const {student, teacher, studentName, teacherName, cost, date, subject, studentApproval} = doc.data()
    return {student, teacher, studentName, teacherName, cost, date, subject, studentApproval}
  })

  classList.forEach((c) => {      
    if (c.student == uid){
      
      var classDate = c.date;

      const dateParts = classDate.split(' ');
      const month = dateParts[0];
      const day = dateParts[1];
      const year = dateParts[2];
      const time = dateParts[4];
      const dateTimeString = `${month} ${day}, ${year} ${time}`;
      
      const date_class = new Date(dateTimeString);

      const today = new Date();
      const date_today = new Date(today);

      if (date_today > date_class) {
        filteredClasses.push(c)
      }
  }});
  filteredClasses.sort(function(a, b) {
    const dateParts1 = a.date.split(' ');
    const month1 = dateParts1[0];
    const day1 = dateParts1[1];
    const year1 = dateParts1[2];
    const time1 = dateParts1[4];
    const dateTimeString1 = `${month1} ${day1}, ${year1} ${time1}`;
    const date_class1 = new Date(dateTimeString1);

    const dateParts2 = b.date.split(' ');
    const month2 = dateParts2[0];
    const day2 = dateParts2[1];
    const year2 = dateParts2[2];
    const time2 = dateParts2[4];
    const dateTimeString2 = `${month2} ${day2}, ${year2} ${time2}`;
    
    const date_class2 = new Date(dateTimeString2);
    return date_class1 - date_class2
  })
  return filteredClasses;  
}

// get all groups
export async function getAllGroups(uid) {
  const groupSnapshot = await fb.getDocs(fb.collection(db, 'groups'))
  const groupsListFromDB = groupSnapshot.docs || []
  const groupList = groupsListFromDB.map(doc=> {
      return doc.data()
  })
  const filteredGroups = []
  groupList.forEach((group) => {
    var flagContain = 1;
    group.participants.forEach((participant)=>{
      if (participant === uid){
        flagContain = 0;
        return;
      }
    })

    if (flagContain === 1 && group.max_participants > group.participants.length){
      filteredGroups.push(group)
    }
  });
  return filteredGroups
}

// get filtered groups
export async function getFilteredGroups(uid, subject, degree, year, day, time, language, participants, location) {
  const filteredGroups = []
  const groupsSnapshot = await fb.getDocs(fb.collection(db, 'groups'))
  const groupsListFromDB = groupsSnapshot.docs || []
  const groupList = groupsListFromDB.map(doc=> {
    return doc.data()
  })
  
  groupList.forEach((group) => {
    var flagContain = 1;
    group.participants.forEach((participant)=>{
      if (participant === uid){
        flagContain = 0;
        return;
      }
    })
    var flagS = 0
    var flagDe = 0
    var flagY = 0
    var flagDa = 0
    var flagT = 0
    var flagLa = 0
    var flagP = 0
    var flagLo = 0
    if (subject === "choose course"){
      flagS = 1
    }
    if (subject !== "choose course" && group.subject === subject){
      flagS = 1
    }
    if (degree === "Select Degree"){
      flagDe = 1
    }
    if (degree !== "Select Degree" && group.degree === degree){        
      flagDe = 1
    }
    if (year === "Select Year Of Study"){
      flagY = 1
    }
    if (year !== "Select Year Of Study" && group.year === year){
      flagY = 1
    }
    if (day === "Select Day"){
      flagDa = 1
    }
    if (day !== "Select Day" && group.day === day){
      flagDa = 1
    }
    if (time === "Select Time"){
      flagT = 1
    }
    if (time !== "Select Time" && group.time === time){
      flagT = 1
    }
    if (language === "Select Language"){
      flagLa = 1
    }
    if (language !== "Select Language" && group.language === language){
      flagLa = 1
    }
    if (participants === "Select Preferred Num Of Participants"){
      flagP = 1
    }
    if (participants !== "Select Preferred Num Of Participants" && group.min_participants <= participants && group.max_participants >= participants){
      flagP = 1
    }
    if (location === "Select Location"){
      flagLo = 1
    }
    if (location !== "Select Location" && group.location === location){
      flagLo = 1
    }
    if (flagContain === 1 && flagS === 1 && flagDe === 1 && flagY === 1 && flagDa === 1 && flagT === 1 && flagLa === 1 && flagP === 1 && flagLo === 1 && group.max_participants > group.participants.length){
      filteredGroups.push(group)
    }
  });

  return filteredGroups;  
}

export async function getGroupParticipants(uid, gid) {
  const groupRef = fb.doc(db, 'groups', gid)
  const groupDoc = await fb.getDoc(groupRef)
  var myParticipants = []
  if (groupDoc.exists()){
    for (var i=0 ; i<groupDoc.data().participants.length ; i++){
      const cuid = groupDoc.data().participants[i]
      if (cuid !== uid){
        const studentsRef = fb.doc(db, 'students', cuid)
        const userDoc = await fb.getDoc(studentsRef)
        if (userDoc.exists()){
          const {name, age, year, degree, phone} = userDoc.data()
          myParticipants.push({name, age, year, degree, phone})
        }
      }
    }
    return myParticipants
  }
  else{
    console.log("error")
    return null
  }
}
// import { initializeApp } from 'firebase/app';
// import * as fb from 'firebase/firestore'
// import 'firebase/auth';
// import 'firebase/firestore'
// import { where } from 'firebase/firestore';
// import { getAuth } from 'firebase/auth'


// //connect to firebase
// const firebaseConfig = {
//     apiKey: "AIzaSyA8gK69clEXFHPBgvmYE71gvDp_5VMlC8A",
//     authDomain: "studybuddy-d48ac.firebaseapp.com",
//     databaseURL: "https://studybuddy.firebaseio.com",
//     projectId: "studybuddy-d48ac"
//     // storageBucket: "<BUCKET>.appspot.com",
//     // messagingSenderId: "<SENDER_ID>",
//   };

// const fireBaseRef = initializeApp(firebaseConfig);
// const db = fb.getFirestore(fireBaseRef);

// export const auth = getAuth(fireBaseRef)

// export async function getStudentDetails(uid) {
//     console.log(uid)
//     const studentsRef = fb.doc(db, 'students', uid)
//     const userDoc = await fb.getDoc(studentsRef)
//     if(userDoc.exists()){
//         const {name, age, year, degree, phone} = userDoc.data()
//         return {name, age, year, degree, phone}
//     } else{
//       console.log("error")
//     }
//     return null
//   }

// export async function getTeacherDetails(uid) {
//   console.log(uid)
//   const teachersRef = fb.doc(db, 'teachers', uid)
//   const userDoc = await fb.getDoc(teachersRef)
//   if(userDoc.exists()){
//     const {id, name, courses, prices, dates, grades, age, year, degree, gender, phone, payBox, rating} = userDoc.data()
//     return {id, name, courses, prices, dates, grades, age, year, degree, gender, phone, payBox, rating}
//   } else{
//     console.log("error")
//   }
//   return null
// }

// export async function getFilteredTeachers(course, date, from, to) {
  
//   //An array that will contain all the teachers match the filter
//   const filteredTeachers = []
//   //creat list contain all teachers from fierbais
//   const teacherSnapshot = await fb.getDocs(fb.collection(db, 'teachers'))
//   const teacherListFromDB = teacherSnapshot.docs || []
//   const teacherList = teacherListFromDB.map(doc=> {
//     const {id, name, courses, prices, dates, grades, degree, rating} = doc.data()
//     return {id, name, courses, prices, dates, grades, degree, rating}
//   })

//   //Translates the hours entered in the filter into numbers
//   var fromNum
//   var toNum
//   if (from == "choose from hour"){
//     fromNum = -1
//   }
//   else{
//     fromNum = parseInt(from.split(":")[0])
//   }
//   if (to == "choose to hour"){
//     toNum = -1
//   }
//   else{
//     toNum = parseInt(to.split(":")[0])
//   }

//   //run on all teachers
//   teacherList.forEach((teacher) => {
//     //flag for each parameter: course, date, time
//     var flagC = 0
//     var flagD = 0
//     var flagT = 0

//     //run on all courses of this teacher
//     const courseList = teacher.courses
//       courseList.forEach((c) => {
//         //if this is the course in the filter or did not enter a course
//         if (c == course || course == "choose course"){
//           flagC = 1
//         }
//       });

//     //run on all dates of this teacher
//     const datesList = teacher.dates
//       datesList.forEach((d) => {
//         //if this is the data in the filter or did not enter a date
//         if (d.includes(date) || date == "choose date"){
//           flagD = 1
//         }
//         const hourNum = parseInt(d.split(" - ")[1].split(":")[0])
//         if (hourNum >= fromNum && hourNum <= toNum){
//           flagT = 1
//         }
//         if (fromNum == -1 && toNum == -1){
//           flagT = 1
//         }
//         if (hourNum >= fromNum && toNum == -1){
//           flagT = 1
//         }
//         if (fromNum == -1 && hourNum <= toNum){
//           flagT = 1
//         }
//       });

//     //if this teacher match the filter in all parameters
//     if ( flagC == 1 && flagD == 1 && flagT == 1){
//       filteredTeachers.push(teacher)
//     }
//   });
//   return filteredTeachers;  
// }

// export async function getAllTeachers() {
  
//   //creat list contain all teachers from fierbais
//   const teacherSnapshot = await fb.getDocs(fb.collection(db, 'teachers'))
//   const teacherListFromDB = teacherSnapshot.docs || []
//   const teacherList = teacherListFromDB.map(doc=> {
//     const {id, name, courses, prices, dates, grades, degree, rating} = doc.data()
//     return {id, name, courses, prices, dates, grades, degree, rating}
//   })
//   return teacherList
// }

// //click on approve payment
// export async function approvePayment(uid, teacherName, date, subject) {
  
//   //find the current class 
//   const q = fb.query(fb.collection(db, 'classes'), fb.where("student", "==", uid), fb.where("teacherName", "==", teacherName), fb.where("subject", "==", subject), fb.where("date", "==", date));
//   const snapshot = await fb.getDocs(q);
//   const classListFromDB = snapshot.docs || []
//   const classList = classListFromDB.map(doc=> {
//       //get class id
//       const {studentApproval} = doc.data()
//       return {studentApproval}
//   })
//   return classList[0].studentApproval

// }

// export async function getTeacherCourses(uid) {
//   console.log(uid)
//   const teachersRef = fb.doc(db, 'teachers', uid)
//   const userDoc = await fb.getDoc(teachersRef)
//   if(userDoc.exists()){
//       const courses = userDoc.data().courses || []
//       return courses
//   } else{
//     console.log("error")
//   }
//   return null
// }

// export async function getTeacherGrades(uid) {
//   console.log(uid)
//   const teachersRef = fb.doc(db, 'teachers', uid)
//   const userDoc = await fb.getDoc(teachersRef)
//   if(userDoc.exists()){
//       const grades = userDoc.data().grades || []
//       return grades
//   } else{
//     console.log("error")
//   }
//   return null
// }

// export async function getTeacherDates(uid) {
//   console.log(uid)
//   const teachersRef = fb.doc(db, 'teachers', uid)
//   const userDoc = await fb.getDoc(teachersRef)
//   if(userDoc.exists()){
//       const dates = userDoc.data().dates || []
//       return dates
//   } else{
//     console.log("error")
//   }
//   return null
// }

// export async function getStudentMobileNumber(uid, name, subject, date) {
//   const q = fb.query(fb.collection(db, 'classes'), fb.where("teacher", "==", uid), fb.where("studentName", "==", name), fb.where("subject", "==", subject), fb.where("date", "==", date));
//   const snapshot = await fb.getDocs(q);
//   const classListFromDB = snapshot.docs || []
//   const classList = classListFromDB.map(doc=> {
//     const {student} = doc.data()
//     return {student}
//   })

//   const studentID = classList[0].student
//   console.log(studentID)
//   const studentsRef = fb.doc(db, 'students', studentID)
//   const userDoc = await fb.getDoc(studentsRef)
//   if(userDoc.exists()){
//       const phone = userDoc.data().phone
//       return phone
//   } else{
//     console.log("error")
//   }
//   return null
// }

// export async function getClassQuery(uid) {
//   const q = fb.query(fb.collection(db, 'classes'), fb.where("teacher", "==", uid));
//   const snapshot = await fb.getDocs(q);
//   const classListFromDB = snapshot.docs || []
//   const classList = classListFromDB.map(doc=> {
//     const {teacher} = doc.data()
//     console.log(doc.data())
//     return {teacher}
//   })

//   return snapshot

//   //return q
// }

// export async function getTeacherMobileNumber(uid, name, subject, date) {
//   console.log("bla bla:" + uid);
//   const auth = getAuth(fireBaseRef)
//   console.log(auth.currentUser);
//   // if (fireBaseRef.auth.currentUser !== null) 
//   //       console.log("user id: " + fireBaseRef.auth.currentUser.uid);
//   const q = fb.query(fb.collection(db, 'classes'), fb.where("student", "==", uid), fb.where("teacherName", "==", name), fb.where("subject", "==", subject), fb.where("date", "==", date));
//   const snapshot = await fb.getDocs(q);
//   const classListFromDB = snapshot.docs || []
//   const classList = classListFromDB.map(doc=> {
//     const {teacher} = doc.data()
//     return {teacher}
//   })

//   const teacherID = classList[0].teacher
//   const teachersRef = fb.doc(db, 'teachers', teacherID)
//   const userDoc = await fb.getDoc(teachersRef)
//   if(userDoc.exists()){
//       const phone = userDoc.data().phone
//       return phone
//   } else{
//     console.log("error")
//   }
//   return null
// }

// export async function getMyGroups(uid) {
  
//   //An array that will contain all my groups
//   const myGroups = []
//   //creat list contain all groups
//   const groupsSnapshot = await fb.getDocs(fb.collection(db, 'groups'))
//   const groupsListFromDB = groupsSnapshot.docs || []
//   const groupsList = groupsListFromDB.map(doc=> {
//     const {participants, subject, day, time, id, min_participants} = doc.data()
//     return {participants, subject, day, time, id, min_participants}
    
//   })
  
//   //run on all groups
//   groupsList.forEach((group) => {

//     if (group.participants.length >= group.min_participants){
//       //run on all participants of this group
//       const participantsList = group.participants
      
//       participantsList.forEach((p) => {
//           //if this is the course in the filter or did not enter a course
//           if (p == uid){
//             myGroups.push(group)
//           }
//         });
//       }
//   });
//   return myGroups;  
// }

// export async function payBoxLink(uid, teacherName, subject, date) {

//   const q = fb.query(fb.collection(db, 'classes'), fb.where("student", "==", uid), fb.where("teacherName", "==", teacherName), fb.where("subject", "==", subject), fb.where("date", "==", date));
//   const snapshot = await fb.getDocs(q);
//   const classListFromDB = snapshot.docs || []
//   const classList = classListFromDB.map(doc=> {
//     const {teacher} = doc.data()
//     return {teacher}
//   })

//   const teacherID = classList[0].teacher
//   const teachersRef = fb.doc(db, 'teachers', teacherID)
//   const userDoc = await fb.getDoc(teachersRef)
//   if(userDoc.exists()){
//       const payBox = userDoc.data().payBox
//       return payBox
//   } else{
//     console.log("error")
//   }
//   return null
// }

//   //click on approve payment
//   export async function approvePaymentTeacher(uid, studentName, date, subject) {
  
//     //find the current class 
//     const q = fb.query(fb.collection(db, 'classes'), fb.where("teacher", "==", uid), fb.where("studentName", "==", studentName), fb.where("subject", "==", subject), fb.where("date", "==", date));
//     const snapshot = await fb.getDocs(q);
//     const classListFromDB = snapshot.docs || []
//     const classList = classListFromDB.map(doc=> {
//         //get class id
//         const {studentApproval} = doc.data()
//         return {studentApproval}
//     })
//     return classList[0].studentApproval
//   }

// export async function getMyClassesStudent(uid) {
  
//   const filteredClasses = []
//   //creat list contain all teachers from fierbais
//   const classSnapshot = await fb.getDocs(fb.collection(db, 'classes'))
//   const classListFromDB = classSnapshot.docs || []
//   const classList = classListFromDB.map(doc=> {
//     const {student, teacher, studentName, teacherName, cost, date, subject} = doc.data()
//     return {student, teacher, studentName, teacherName, cost, date, subject}
//   })

//   classList.forEach((c) => {      
//     if (c.student == uid){
//       filteredClasses.push(c)
//     }
//   });

//   return filteredClasses;  
// }

// export async function getMyClasses(uid) {
  
//   const filteredClasses = []
//   //creat list contain all teachers from fierbais
//   const classSnapshot = await fb.getDocs(fb.collection(db, 'classes'))
//   const classListFromDB = classSnapshot.docs || []
//   const classList = classListFromDB.map(doc=> {
//     const {student, teacher, studentName, teacherName, cost, date, subject} = doc.data()
//     return {student, teacher, studentName, teacherName, cost, date, subject}
//   })

//   classList.forEach((c) => {      
//     if (c.teacher == uid){
//       filteredClasses.push(c)
//     }
//   });

//   return filteredClasses;  
// }

// export async function getClassPayments(uid) {
  
//   const filteredClasses = []
//   //creat list contain all teachers from fierbais
//   const classSnapshot = await fb.getDocs(fb.collection(db, 'classes'))
//   const classListFromDB = classSnapshot.docs || []
//   const classList = classListFromDB.map(doc=> {
//     const {student, teacher, studentName, teacherName, cost, date, subject} = doc.data()
//     return {student, teacher, studentName, teacherName, cost, date, subject}
//   })

//   classList.forEach((c) => {      
//     if (c.teacher == uid){
      
//       var classDate = c.date;

//       const dateParts = classDate.split(' ');
//       const month = dateParts[0];
//       const day = dateParts[1];
//       const year = dateParts[2];
//       const time = dateParts[4];
//       const dateTimeString = `${month} ${day}, ${year} ${time}`;
      
//       const date_class = new Date(dateTimeString);

//       const today = new Date();
//       const date_today = new Date(today);

//       if (date_today > date_class) {
//         filteredClasses.push(c)
//     }
//   }});

//   return filteredClasses;  
// }


// export async function getClassPaymentsStudent(uid) {
  
//   const filteredClasses = []
//   //creat list contain all teachers from fierbais
//   const classSnapshot = await fb.getDocs(fb.collection(db, 'classes'))
//   const classListFromDB = classSnapshot.docs || []
//   const classList = classListFromDB.map(doc=> {
//     const {student, teacher, studentName, teacherName, cost, date, subject} = doc.data()
//     return {student, teacher, studentName, teacherName, cost, date, subject}
//   })

//   classList.forEach((c) => {      
//     if (c.student == uid){
      
//       var classDate = c.date;

//       const dateParts = classDate.split(' ');
//       const month = dateParts[0];
//       const day = dateParts[1];
//       const year = dateParts[2];
//       const time = dateParts[4];
//       const dateTimeString = `${month} ${day}, ${year} ${time}`;
      
//       const date_class = new Date(dateTimeString);

//       const today = new Date();
//       const date_today = new Date(today);

//       if (date_today > date_class) {
//         filteredClasses.push(c)
//     }
//   }});

//   return filteredClasses;  
// }

// // get all groups
// export async function getAllGroups(uid) {
//   const groupSnapshot = await fb.getDocs(fb.collection(db, 'groups'))
//   const groupsListFromDB = groupSnapshot.docs || []
//   const groupList = groupsListFromDB.map(doc=> {
//       return doc.data()
//   })
//   const filteredGroups = []
//   groupList.forEach((group) => {
//     var flagContain = 1;
//     group.participants.forEach((participant)=>{
//       if (participant === uid){
//         flagContain = 0;
//         return;
//       }
//     })

//     if (flagContain === 1 && group.max_participants > group.participants.length){
//       filteredGroups.push(group)
//     }
//   });
//   return filteredGroups
// }

// // get filtered groups
// export async function getFilteredGroups(uid, subject, degree, year, day, time, language, participants, location) {
//   const filteredGroups = []
//   const groupsSnapshot = await fb.getDocs(fb.collection(db, 'groups'))
//   const groupsListFromDB = groupsSnapshot.docs || []
//   const groupList = groupsListFromDB.map(doc=> {
//     return doc.data()
//   })
  
//   groupList.forEach((group) => {
//     var flagContain = 1;
//     group.participants.forEach((participant)=>{
//       if (participant === uid){
//         flagContain = 0;
//         return;
//       }
//     })
//     var flagS = 0
//     var flagDe = 0
//     var flagY = 0
//     var flagDa = 0
//     var flagT = 0
//     var flagLa = 0
//     var flagP = 0
//     var flagLo = 0
//     if (subject === "choose course"){
//       flagS = 1
//     }
//     if (subject !== "choose course" && group.subject === subject){
//       flagS = 1
//     }
//     if (degree === "Select Degree"){
//       flagDe = 1
//     }
//     if (degree !== "Select Degree" && group.degree === degree){        
//       flagDe = 1
//     }
//     if (year === "Select Year Of Study"){
//       flagY = 1
//     }
//     if (year !== "Select Year Of Study" && group.year === year){
//       flagY = 1
//     }
//     if (day === "Select Day"){
//       flagDa = 1
//     }
//     if (day !== "Select Day" && group.day === day){
//       flagDa = 1
//     }
//     if (time === "Select Time"){
//       flagT = 1
//     }
//     if (time !== "Select Time" && group.time === time){
//       flagT = 1
//     }
//     if (language === "Select Language"){
//       flagLa = 1
//     }
//     if (language !== "Select Language" && group.language === language){
//       flagLa = 1
//     }
//     if (participants === "Select Preferred Num Of Participants"){
//       flagP = 1
//     }
//     if (participants !== "Select Preferred Num Of Participants" && group.min_participants <= participants && group.max_participants >= participants){
//       flagP = 1
//     }
//     if (location === "Select Location"){
//       flagLo = 1
//     }
//     if (location !== "Select Location" && group.location === location){
//       flagLo = 1
//     }
//     if (flagContain === 1 && flagS === 1 && flagDe === 1 && flagY === 1 && flagDa === 1 && flagT === 1 && flagLa === 1 && flagP === 1 && flagLo === 1 && group.max_participants > group.participants.length){
//       filteredGroups.push(group)
//     }
//   });

//   return filteredGroups;  
// }