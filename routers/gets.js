import express from 'express';
import * as get_functions from "../model/get_functions.js"

export const getRouter = express.Router()

getRouter.get('/getStudentDetails', async(req, res) =>{
    const user = await get_functions.getStudentDetails(req.query.uid)
    if (user.length === 0){
      return res.status(404).send()
    }
    return res.status(200).send(user)
  })

  getRouter.get('/getTeacherDetails', async(req, res) =>{
    const user = await get_functions.getTeacherDetails(req.query.uid)
    if (user.length === 0){
      return res.status(404).send()
    }
    return res.status(200).send(user)
  })