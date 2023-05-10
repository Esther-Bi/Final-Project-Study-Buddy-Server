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

export async function updateTeacherDetails(uid, name, year, degree, gender, age, phone, payBox) {
    const teachersRef = fb.doc(db, 'teachers', uid)
    const userDoc = await fb.getDoc(teachersRef)
    if(userDoc.exists()){
        await fb.updateDoc(teachersRef, {name: name})
        await fb.updateDoc(teachersRef, {year: year})
        await fb.updateDoc(teachersRef, {degree: degree})
        await fb.updateDoc(teachersRef, {gender: gender})
        await fb.updateDoc(teachersRef, {age: age})
        await fb.updateDoc(teachersRef, {phone: phone})
        await fb.updateDoc(teachersRef, {payBox: payBox})
        return "done"
    }
    else{
        console.log("error")
    }
}

//add new user to the database
export async function newTeacher(uid, name, year, degree, gender, age, phone, payBox) {
    var courses = []
    var grades = []
    var prices = []
    var dates = []
    await fb.setDoc(fb.doc(db, "teachers", uid), 
    {
        year: year,
        degree: degree,
        gender: gender,
        age: age,
        name: name,
        payBox: payBox,
        phone: phone,
        id: uid,
        courses: courses,
        grades: grades,
        prices: prices,
        dates: dates,
        rate: null
    });
    return "done"
}

//book new class
export async function bookClass(uid, classes, courseValueFromSpinner, prices, dateValueFromSpinner, teacherID) {

    var teacherName
    var studentName
    var nawDates = []

    //the chosen teacher
    console.log(teacherID)
    const teachersRef = fb.doc(db, 'teachers', teacherID)
    const userDoc = await fb.getDoc(teachersRef)
    if(userDoc.exists()){
        const {name, dates} = userDoc.data()
        //take his name
        teacherName = name
        //run on all dates of this teacher
        dates.forEach((d) => {
            if (d != dateValueFromSpinner){
                nawDates.push(d)
            }
        });
        //update that the chousen date is not availabel
        await fb.updateDoc(teachersRef, {dates: nawDates})

    } else{
      console.log("error")
    }
    //find price of course
    var indexOfCuorse = classes.indexOf(courseValueFromSpinner)
    var price = prices[indexOfCuorse]

    console.log(uid)
    const studentsRef = fb.doc(db, 'students', uid)
    const userDocS = await fb.getDoc(studentsRef)
    if(userDocS.exists()){
        const {name} = userDocS.data()
        //take his name
        studentName = name
    } else{
      console.log("error")
    }

    const docRef = await fb.addDoc(fb.collection(db, "classes"), 
    {
        studentName: studentName,
        teacherName: teacherName,
        student: uid, 
        teacher: teacherID, 
        subject: courseValueFromSpinner , 
        date: dateValueFromSpinner, 
        cost: parseInt(price),
        past: "no",
        studentApproval: 0
    });

    return "done"
}

//update teacher rate
export async function updateRate(uid, teacherName, date, subject, rating) {
    
    //find the current class 
    const q = fb.query(fb.collection(db, 'classes'), fb.where("student", "==", uid), fb.where("teacherName", "==", teacherName), fb.where("subject", "==", subject), fb.where("date", "==", date));
    const snapshot = await fb.getDocs(q);
    const classListFromDB = snapshot.docs || []
    const classList = classListFromDB.map(doc=> {
        //get teacher id from curr class
        const {teacher} = doc.data()
        return {teacher}
    })

    const teacherID = classList[0].teacher
    //enter to the teacher
    const teachersRef = fb.doc(db, 'teachers', teacherID)
    const userDoc = await fb.getDoc(teachersRef)
    if(userDoc.exists()){
        const corrRate = userDoc.data().rate
        //update teacher rate
        if (corrRate == null){
            await fb.updateDoc(teachersRef, {rate: rating})
            return "done"
        }
        else{
            const newRate = (parseFloat(corrRate)*3 + parseFloat(rating))/4
            await fb.updateDoc(teachersRef, {rate: newRate})
            return "done"
        }
    } else{
        console.log("error")
    }

}

//update studentApproval to 1 in class
export async function approveYes(uid, teacherName, date, subject) {

    //find the current class 
    const q = fb.query(fb.collection(db, 'classes'), fb.where("student", "==", uid), fb.where("teacherName", "==", teacherName), fb.where("subject", "==", subject), fb.where("date", "==", date));
    const snapshot = await fb.getDocs(q);
    const classListFromDB = snapshot.docs || []
    const classList = classListFromDB.map(doc=> {
        //get class id
        const classid = doc.id
        return {classid}
    })
    //enter to this class
    const classesRef = fb.doc(db, 'classes', classList[0].classid)
    const userDoc = await fb.getDoc(classesRef)
    if(userDoc.exists()){
        //apdate studentApproval
        await fb.updateDoc(classesRef, {studentApproval: 1})
        return "done"
    } else{
        console.log("error")
    }

}

//add course and grade to teacher
export async function addCourseAndGradeToTeacher(uid, course, grade, price) {
    const teachersRef = fb.doc(db, 'teachers', uid)
    const userDoc = await fb.getDoc(teachersRef)
    if(userDoc.exists()){
        var courses = []
        var grades = []
        var prices = []
        for(var i=0; i<userDoc.data().courses.length; i++){
            courses.push(userDoc.data().courses[i])
            grades.push(userDoc.data().grades[i])
            prices.push(userDoc.data().prices[i])
        }
        var num_grade = parseInt(grade, 10);
        var num_price = parseInt(price, 10);
        courses.push(course)
        grades.push(num_grade)
        prices.push(num_price)
        await fb.updateDoc(teachersRef, {courses: courses})
        await fb.updateDoc(teachersRef, {grades: grades})
        await fb.updateDoc(teachersRef, {prices: prices})
        return "done"
    }
    else{
        console.log("error")
    }
}

//delete course and grade from teacher
export async function deleteCourseAndGradeFromTeacher(uid, course) {
    const teachersRef = fb.doc(db, 'teachers', uid)
    const userDoc = await fb.getDoc(teachersRef)
    if(userDoc.exists()){
        var courses = []
        var grades = []
        var prices = []
        for(var i=0; i<userDoc.data().courses.length; i++){
            if(userDoc.data().courses[i] != course){
                courses.push(userDoc.data().courses[i])
                grades.push(userDoc.data().grades[i])
                prices.push(userDoc.data().prices[i])
            }
        }
        await fb.updateDoc(teachersRef, {courses: courses})
        await fb.updateDoc(teachersRef, {grades: grades})
        await fb.updateDoc(teachersRef, {prices: prices})
        return "done"
    }
    else{
        console.log("error")
    }
}

//add date to teacher
export async function addDateToTeacher(uid, date) {
    const teachersRef = fb.doc(db, 'teachers', uid)
    const userDoc = await fb.getDoc(teachersRef)
    if(userDoc.exists()){
        var dates = []
        for(var i=0; i<userDoc.data().dates.length; i++){
            dates.push(userDoc.data().dates[i])
        }
        dates.push(date)
        await fb.updateDoc(teachersRef, {dates: dates})
        return "done"
    }
    else{
        console.log("error")
    }
}

//delete date from teacher
export async function deleteDateFromTeacher(uid, date) {
    const teachersRef = fb.doc(db, 'teachers', uid)
    const userDoc = await fb.getDoc(teachersRef)
    if(userDoc.exists()){
        var dates = []
        for(var i=0; i<userDoc.data().dates.length; i++){
            if(userDoc.data().dates[i] != date){
                dates.push(userDoc.data().dates[i])
            }
        }
        await fb.updateDoc(teachersRef, {dates: dates})
        return "done"
    }
    else{
        console.log("error")
    }
}

//delete class through teacher
export async function deleteClassTeacher(uid, name, subject, date) {
    const q = fb.query(fb.collection(db, 'classes'), fb.where("teacher", "==", uid), fb.where("studentName", "==", name), fb.where("subject", "==", subject), fb.where("date", "==", date));
    const snapshot = await fb.getDocs(q);
    const classListFromDB = snapshot.docs || []
    const classList = classListFromDB.map(doc=> {
        const date = doc.data().date
        const cid = doc.id
        return {date,cid}
    })
    const teachersRef = fb.doc(db, 'teachers', uid)
    const userDoc = await fb.getDoc(teachersRef)
    if(userDoc.exists()){
        var dates = []
        for(var i=0; i<userDoc.data().dates.length; i++){
            dates.push(userDoc.data().dates[i])
        }
        dates.push(classList[0].date)
        await fb.updateDoc(teachersRef, {dates: dates})
        await fb.deleteDoc(fb.doc(db, "classes", classList[0].cid))
        return "done"
    }
    else{
        console.log("error")
    }
}

//delete class through student
export async function deleteClassStudent(uid, name, subject, date) {
    const q = fb.query(fb.collection(db, 'classes'), fb.where("student", "==", uid), fb.where("teacherName", "==", name), fb.where("subject", "==", subject), fb.where("date", "==", date));
    const snapshot = await fb.getDocs(q);
    const classListFromDB = snapshot.docs || []
    const classList = classListFromDB.map(doc=> {
        const date = doc.data().date
        const cid = doc.id
        const teacher = doc.data().teacher
        return {date,cid,teacher}
    })
    const teachersRef = fb.doc(db, 'teachers', classList[0].teacher)
    const userDoc = await fb.getDoc(teachersRef)
    if(userDoc.exists()){
        var dates = []
        for(var i=0; i<userDoc.data().dates.length; i++){
            dates.push(userDoc.data().dates[i])
        }
        dates.push(classList[0].date)
        await fb.updateDoc(teachersRef, {dates: dates})
        await fb.deleteDoc(fb.doc(db, "classes", classList[0].cid))
        return "done"
    }
    else{
        console.log("error")
    }
}


//update the past classes to past == yes
