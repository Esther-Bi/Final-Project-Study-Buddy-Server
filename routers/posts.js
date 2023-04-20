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