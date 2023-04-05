import express from 'express';
import {connection} from '../connection/connection.js';
const makerspaceRouter = express.Router();

makerspaceRouter
    .post('/submit', postSubmit)
    .post('/check', postCheck)
    .post('/hpc', postHPC)

export function postSubmit(req, resFinal){
    var data = req.body;
    var date = new Date();
    
	var booking_date=data.date;
	var booking_time=data.booking_time;
	var topic=data.d_topic;
	var p_no=data.p_no;
	var mobile=data.mobile;

    var created_date = ("0" + date.getDate()).slice(-2)+'/'+("0" + (date.getMonth() + 1)).slice(-2)+'/'+date.getFullYear();
    var created_time = date.getHours()+':'+date.getMinutes()+':'+date.getSeconds(); // FORMAT date -----------------

    if(typeof data.bitsid !== 'undefined'){
        var query = 'USE bitslib; select * from users u where u.bitsid= ?';
        connection.query(query, [data.bitsid], (err, res)=>{
            if(err) throw err;
            var arr = Object.values(JSON.parse(JSON.stringify(res)));
            var name = arr[1][0]['name'];
            var bitsid = arr[1][0]['bitsid'];
            var email = arr[1][0]['email'];

            query = 'select * from makerspace_booking l where l.booking_date=? and l.booking_time = ? and l.stage="1"'; 
            connection.query(query, [booking_date, booking_time], (err, res)=>{
                if(err) throw err;

                if(Object.values(JSON.parse(JSON.stringify(res))).length == 0){
                    query = 'select * from makerspace_booking l where l.stage="1" and l.bitsid=? and l.booking_date=?';
                    connection.query(query, [bitsid, booking_date], (err, res)=>{
                        if(err) throw err;
                        if(Object.values(JSON.parse(JSON.stringify(res))).length == 0){

                            if(typeof data.purpose != 'undefined'){
                                var purpose = data.purpose;
                                query = `insert into makerspace_booking(
                                    name, bitsid, email, mobile, purpose, topic, booking_date, booking_time, p_no, status, created_date, created_time, stage, action_taken_by, f_cost, duration, total, s_name) 
								values(?, ?, ?, ?, ?, ?, ?, ?, ?, "pending", ?, ?, 1, "", "", "", "","")`; 
								connection.query(query, [name, bitsid, email, mobile, purpose, topic, booking_date, booking_time, p_no, created_date, created_time], (err, res)=>{
                                    if(err) throw err;
                                    resFinal.send({
                                        message: 'Thank you for sending your request. We will get back to you soon.'
                                    })
                                })                                  
                                

                            } else resFinal.send({
                                message: 'Please select your purpose for booking'
                            })

                        } else resFinal.send({
                            message: 'You can not book for more than one hour a day.<br/>Please select another date for a new booking.'
                        })
                    })
                } else resFinal.send({
                    message: 'MakerSpace Room is already booked on your selected date and time. Please select different time slot.'
                })
            })
        })
    } else resFinal.send({
        message: 'Sorry! Either you have not logged in or your session has expired'
    })
}

export function postHPC(req, resFinal){
    var data = req.body;

    var booking_date=data.date;
	var booking_time=data.booking_time;
	var software=data.software;
	var other_software=data.other_software;
	var software_name = software +" "+other_software;
	var topic=data.d_topic;
	var p_no=data.p_no;
	var mobile=data.mobile;

    var date = new Date();
    var created_date = ("0" + date.getDate()).slice(-2)+'/'+("0" + (date.getMonth() + 1)).slice(-2)+'/'+date.getFullYear();
    var created_time = date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();

    if(typeof data.bitsid !== 'undefined'){
        
        var query = 'USE bitslib; select * from users l where l.bitsid=?';
        connection.query(query, [data.bitsid], (err, res)=>{
            if(err) throw err;
            var arr = Object.values(JSON.parse(JSON.stringify(res)));
            var name = arr[1][0]['name'];
            var bitsid = arr[1][0]['bitsid'];
            var name = arr[1][0]['email'];

            query = 'select * from mshpc_booking l where l.booking_date= ? and l.booking_time = ? and l.stage="1"'
            connection.query(query, [booking_date, booking_time], (err, res)=>{
                if(err) throw err;
                if(Object.values(JSON.parse(JSON.stringify(res))).length == 0){
                    query = `insert into mshpc_booking(name, bitsid, email, mobile, purpose, topic, booking_date, booking_time, p_no, status, created_date, created_time, stage, action_taken_by) 
                    values(?, ?, ?, ?, ?, ?,?, ?, ?, "pending", ?, ?, 1, "")`; 
                    connection.query(query, [name, bitsid, email, mobile, purpose, topic, booking_date, booking_time, p_no, created_date, created_time], (err, res)=>{
                        if(err) throw err;
                        resFinal.send({
                            message: 'Thank you for sending your request. We will get back to you soon.'
                        });
                    })
        
                } else resFinal.send({
                    message: 'HPC is already booked on your selected date and time. Please select different time slot.'
                })
            })
        })
    } else resFinal.send({
        message: 'Sorry! Either you have not logged in or your session has expired'
    })
}

export function postCheck(req, resFinal){
    var data = req.body;
    if(typeof data.date !== 'undefined'){
        var date = data.date;
        query = 'USE bitslib; select * from makerspace_booking l where l.booking_date=? and l.stage="1"';
        connection.query(query, [date], (err, res)=>{
            if(err) throw err;
            var array = Object.values(JSON.parse(JSON.stringify(res)));
            if(array[1].length > 0) 
                resFinal.send({
                    array: array[1]
                })
            else resFinal.send({
                array: []
            })
        })

    } else resFinal.send({
        err: 0
    })
}

export default makerspaceRouter;