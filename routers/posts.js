import express from 'express';
import * as post_functions from "../model/post_functions.js"
import bodyParser from "body-parser"

export const postRouter = express.Router()

/** bodyParser.urlencoded(options)
 * Parses the text as URL encoded data (which is how browsers tend to send form data from regular forms set to POST)
 * and exposes the resulting object (containing the keys and values) on req.body
 */
postRouter.use(bodyParser.urlencoded({
  extended: true
}));

/**bodyParser.json(options)
* Parses the text as JSON and exposes the resulting object on req.body.
*/
postRouter.use(bodyParser.json());

//update user details
postRouter.post('/updateStudentDetails', async (req, res) => {
    const userList = await post_functions.updateStudentDetails(req.body.uid, req.body.name, req.body.year, req.body.degree, req.body.gender, req.body.age, req.body.phone)
    if (userList.length === 0 ) {
      return res.status(404).send()
    }
    return res.status(200).send("done")
    
  })

postRouter.post('/updateTeacherDetails', async (req, res) => {
  const userList = await post_functions.updateTeacherDetails(req.body.uid, req.body.name, req.body.year, req.body.degree, req.body.gender, req.body.age, req.body.phone, req.body.payBox)
  if (userList.length === 0 ) {
    return res.status(404).send()
  }
  return res.status(200).send("done")
  
})

//update teacher details (first time)
postRouter.post('/newTeacher', async (req, res) => {
  const ans = await post_functions.newTeacher(req.body.uid, req.body.name, req.body.year, req.body.degree, req.body.gender, req.body.age, req.body.phone, req.body.payBox)
  if (ans.length === 0 ) {
    return res.status(404).send()
  }
  return res.status(200).send("done")
})

//update teacher details (first time)
postRouter.post('/bookClass', async (req, res) => {
  const ans = await post_functions.bookClass(req.body.uid, req.body.classes, req.body.courseValueFromSpinner, req.body.prices, req.body.dateValueFromSpinner, req.body.teacherID)
  if (ans.length === 0 ) {
    return res.status(404).send()
  }
  return res.status(200).send("done")
})

//update teacher rate
postRouter.post('/updateRate', async (req, res) => {
  const ans = await post_functions.updateRate(req.body.uid, req.body.teacherName, req.body.date, req.body.subject, req.body.rating)
  if (ans.length === 0 ) {
    return res.status(404).send()
  }
  return res.status(200).send("done")
})

//update tstudentApproval in class
postRouter.post('/approveYes', async (req, res) => {
  const ans = await post_functions.approveYes(req.body.uid, req.body.teacherName, req.body.date, req.body.subject)
  if (ans.length === 0 ) {
    return res.status(404).send()
  }
  return res.status(200).send("done")
})

//add course and grade to teacher
postRouter.post('/addCourseAndGradeToTeacher', async (req, res) => {
  const userList = await post_functions.addCourseAndGradeToTeacher(req.body.uid, req.body.course, req.body.grade, req.body.price)
  if (userList.length === 0 ) {
    return res.status(404).send()
  }
  return res.status(200).send("done")
  
})

//delete course and grade from teacher
postRouter.post('/deleteCourseAndGradeFromTeacher', async (req, res) => {
  const userList = await post_functions.deleteCourseAndGradeFromTeacher(req.body.uid, req.body.course)
  if (userList.length === 0 ) {
    return res.status(404).send()
  }
  return res.status(200).send("done")
  
})

//add date to teacher
postRouter.post('/addDateToTeacher', async (req, res) => {
  const userList = await post_functions.addDateToTeacher(req.body.uid, req.body.date)
  if (userList.length === 0 ) {
    return res.status(404).send()
  }
  return res.status(200).send("done")
  
})

//delete date from teacher
postRouter.post('/deleteDateFromTeacher', async (req, res) => {
  const userList = await post_functions.deleteDateFromTeacher(req.body.uid, req.body.date)
  if (userList.length === 0 ) {
    return res.status(404).send()
  }
  return res.status(200).send("done")
  
})

//delete class through teacher
postRouter.post('/deleteClassTeacher', async (req, res) => {
  const userList = await post_functions.deleteClassTeacher(req.body.uid, req.body.name, req.body.subject, req.body.date)
  if (userList.length === 0 ) {
    return res.status(404).send()
  }
  return res.status(200).send("done")
  
})

//delete class through student
postRouter.post('/deleteClassStudent', async (req, res) => {
  const userList = await post_functions.deleteClassStudent(req.body.uid, req.body.name, req.body.subject, req.body.date)
  if (userList.length === 0 ) {
    return res.status(404).send()
  }
  return res.status(200).send("done")
  
})