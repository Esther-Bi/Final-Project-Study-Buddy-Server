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
  
  getRouter.get('/getFilteredTeachers', async(req, res) =>{
    const user = await get_functions.getFilteredTeachers(req.query.course, req.query.date, req.query.from, req.query.to)
    if (user.length === 0){
      return res.status(404).send()
    }
    return res.status(200).send(user)
  })

  getRouter.get('/getAllTeachers', async(req, res) =>{
    const user = await get_functions.getAllTeachers()
    if (user.length === 0){
      return res.status(404).send()
    }
    return res.status(200).send(user)
  })

  //click on approve payment
  getRouter.get('/approvePayment', async(req, res) =>{
    const user = await get_functions.approvePayment(req.query.uid, req.query.teacherName, req.query.date, req.query.subject)
    if (user !== 0 && user !== 1){
      return res.status(404).send()
    }
    return res.status(200).send(user.toString())
  })

  getRouter.get('/getTeacherCourses', async(req, res) =>{
    const user = await get_functions.getTeacherCourses(req.query.uid)
    if (user.length === 0){
      return res.status(404).send()
    }
    return res.status(200).send(user)
  })
  
  getRouter.get('/getTeacherGrades', async(req, res) =>{
    const user = await get_functions.getTeacherGrades(req.query.uid)
    if (user.length === 0){
      return res.status(404).send()
    }
    return res.status(200).send(user)
  })
  
  getRouter.get('/getTeacherDates', async(req, res) =>{
    const user = await get_functions.getTeacherDates(req.query.uid)
    if (user.length === 0){
      return res.status(404).send()
    }
    return res.status(200).send(user)
  })
  
  getRouter.get('/getStudentMobileNumber', async(req, res) =>{
    const user = await get_functions.getStudentMobileNumber(req.query.uid, req.query.name, req.query.subject, req.query.date)
    if (user.length === 0){
      return res.status(404).send()
    }
    return res.status(200).send(user)
  })
  
  getRouter.get('/getClassQuery', async(req, res) =>{
    const user = await get_functions.getClassQuery(req.query.uid)
    if (user.length === 0){
      return res.status(404).send()
    }
    return res.status(200).send(user)
  })
  
  getRouter.get('/getTeacherMobileNumber', async(req, res) =>{
    const user = await get_functions.getTeacherMobileNumber(req.query.uid, req.query.name, req.query.subject, req.query.date)
    if (user.length === 0){
      return res.status(404).send()
    }
    return res.status(200).send(user)
  })