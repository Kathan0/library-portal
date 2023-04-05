import express from 'express';
import {connection} from '../connection/connection.js';
const innovationRouter = express.Router();
//order of request to be maintained => check1 , submit, check2, process
innovationRouter
    .post('/submit', postInnovation) // for submitting booking
    .post('/check1', checkInnovation) // for checking all bookings
    .post('/process', processInnovation) // for confirming booking
    .post('/check2', processCheck) // for displaying total bookings on booked date and time

export function postInnovation(req, resFinal){
    var data = req.body;
    if(typeof data.bitsid != 'undefined'){
        var date = new Date();        
        var bitsid = data.bitsid;

        var booking_date = data.booking_date;
        var booking_time = data.booking_time;
        var mobile = data.mobile;
        var p_no = data.p_no;

        var created_date = ("0" + date.getDate()).slice(-2)+'/'+("0" + (date.getMonth() + 1)).slice(-2)+'/'+date.getFullYear();
        var created_time = date.getHours()+":"+date.getMinutes()+':'+date.getSeconds();

        var queryTemp = 'USE bitslib; delete from innovation_zone_booking l where l.bitsid= ? and l. stage="0"'
        connection.query(queryTemp, [bitsid], (err, res)=>{
            if(err) throw err;
            var query = 'select * from innovation_zone_booking l where l.stage="1" and l.bitsid=? and l.booking_date= ?';
            connection.query(query, [bitsid, booking_date], (err, res)=>{
                if(err) throw err;
                
                if(Object.values(JSON.parse(JSON.stringify(res))).length == 0){
                    query = 'select * from users l where l.bitsid= ?';
                    connection.query(query, [bitsid], (err, res)=>{
                        if(err) throw err;
                        var info = Object.values(JSON.parse(JSON.stringify(res)));

                        var name = info[0]['name'];
                        var bitsid = info[0]['bitsid'];
                        var email = info[0]['email'];

                        query = `
                        insert into innovation_zone_booking(name, bitsid, email, mobile, purpose, topic, booking_date, booking_time, p_no, software, dep_name, f_code, status, created_date, created_time, stage, action_taken_by, booking_type, location) 
                        values(?, ?, ?, ?, "pending", "",?, ?, ?, "", "", "", "pending", ?, ?, 0, "", "", "")`;
                        connection.query(query, [name, bitsid, email, mobile, booking_date, booking_time, p_no, created_date, created_time], (err, res)=>{
                            if(err) throw err;

                            resFinal.send({
                                success: 1 // proceed to innovation zone booking form process
                            })
                        } )
                    })

                } else resFinal.send({
                    message:'You can not book more than one hour in a day. Please select other date for new booking'
                })
            }) 
			
        })
    
    } else resFinal.send({
        message: 'Sorry! Either you have not logged in or your session has expired'
    })
}

export function checkInnovation(req, resFinal){
    var data = req.body;
    var date = data.date;

	var query = 'use bitslib; select * from innovation_zone_booking l where l.booking_date= ? and l.stage= "1"';
    connection.query(query, [date], (err, res)=>{
        if(err) throw err;
        var array = Object.values(JSON.parse(JSON.stringify(res)));
        if(array[1].length > 0)
            resFinal.send({array: array[1]});

        else resFinal.send({array: [], message:  "You can select any time between 09:00AM to 06:00PM"})
    })
}

export function processInnovation(req, resFinal){
    var data = req.body;
    if(typeof data.radio_purpose != 'undefined'){

        //variables in request
        var purpose = data.radio_purpose;
        var bitsid = data.bitsid;
        //end

        if(purpose == "Simulation Software"){
            
            var query = 'use bitslib; select * from innovation_zone_booking l where l.bitsid= ? and l.stage="0"';
            connection.query(query, [bitsid], (err, res)=>{
                if(err) throw err;
                var arr = Object.values(JSON.parse(JSON.stringify(res)));
                if(arr[1].length == 0)
                    resFinal.send({
                        err: -2
                    })
                else {

                    var booking_date = arr[1][0]['booking_date'];
                    var booking_time = arr[1][0]['booking_time'];
    
                    query = 'select * from innovation_zone_booking l where l.booking_date= ? and l.booking_time = ? and l.purpose="Simulation Software" and l.stage="1"';
                    connection.query(query, [booking_date, booking_time], (err, res)=>{
                        if(err) throw err;
                        var arr =  Object.values(JSON.parse(JSON.stringify(res)));
    
                        query = 'select * from innovation_zone_booking l where l.booking_date= ? and l.booking_time = ? and l.purpose="Simulation Software and Space" and l.stage="1"'
                        connection.query(query, [booking_date, booking_time], (err, res1)=>{
                            if(err) throw err;
                            var arr1 =  Object.values(JSON.parse(JSON.stringify(res1)));
                            var arrComb = arr.concat(arr1);
    
                            if(arrComb.length >= 4){
                                        query = 'delete from innovation_zone_booking l where l.booking_date=? and l.booking_time =? and l.bitsid=? and l.stage="0"'; 
                                        connection.query(query, [booking_date, booking_time, bitsid], (err, res)=>{
                                            if(err) throw err;
    
                                            resFinal.send({
                                                err: -1,
                                                message:'All Simulation Software computers are booked on your selected date and time. Please select different time slot.'
                                            });
                                        })
                            } else {
                                    var software = data.software;
                                    var e_items = data.e_items;
                                    var comments = data.comment;
    
                                    if(software == 'Ansys'){
                                        var query = 'select * from innovation_zone_booking l where l.bitsid= ? and l.stage="0"';
                                        connection.query(query, [bitsid], (err, res)=>{
                                            if(err) throw err;
                                            var arr = Object.values(JSON.parse(JSON.stringify(res)));
                                            var booking_date = arr[0]['booking_date'];
                                            var booking_time = arr[0]['booking_time'];
    
                                            query = 'select * from innovation_zone_booking l where l.booking_date= ? and l.booking_time = ? and l.software="Ansys" and l.stage="1"';
                                            connection.query(query, [booking_date, booking_time], (err, res)=>{
                                                if(err) throw err;
                                                if(Object.values(JSON.parse(JSON.stringify(res))).length <= 0){
                                                    query = 'update innovation_zone_booking l set l.purpose="Simulation Software", l.software="Ansys", l.stage=1, l.booking_type="Simulation Software", l.location="Computer 4", l.e_items=?, l.comments=? where l.bitsid=? and l.stage="0"';
                                                    connection.query(query, [e_items, comments, bitsid], (err, res)=>{
                                                        if(err) throw err;
                                                        resFinal.send({
                                                            seat: 4,
                                                            message: 'Thank you for sending your request.Your seating location is Computer 4'
                                                        })
                                                    })
                                                } else {
                                                    query = 'select * from innovation_zone_booking l where l.bitsid= ? and l.stage="0"';
                                                    connection.query(query, [bitsid], (err, res)=>{
                                                        if(err) throw err;
                                                        var arr = Object.values(JSON.parse(JSON.stringify(res)));
                                                        var booking_date = arr[0]['booking_date'];
                                                        var booking_time = arr[0]['booking_time'];
    
                                                        query = 'select * from innovation_zone_booking l where l.booking_date= ? and l.booking_time = ? and l.location="Computer 1" and l.stage="1"';
                                                        connection.query(query, [booking_date, booking_time], (err, res)=>{
                                                            if(err) throw err;
                                                            if(Object.values(JSON.parse(JSON.stringify(res))).length <= 0){
                                                                query = 'update innovation_zone_booking l set l.purpose="Simulation Software", l.software="Ansys", l.stage=1, l.booking_type="Simulation Software", l.location="Computer 1", l.e_items=?, l.comments=? where l.bitsid=? and l.stage="0"';
                                                                connection.query(query, [e_items, comments, bitsid], (err, res)=>{
                                                                    if(err) throw err;
                                                                    resFinal.send({
                                                                        seat: 1,
                                                                        message: 'Thank you for sending your request. Your seating location is Computer 1'
                                                                    })
                                                                })
                                                            }
                                                            else {
                                                                query = 'select * from innovation_zone_booking l where l.bitsid= ? and l.stage="0"';
                                                                connection.query(query, [bitsid], (err, res)=>{
                                                                    if(err) throw err;
                                                                    var arr = Object.values(JSON.parse(JSON.stringify(res)));
                                                                    var booking_date = arr[0]['booking_date'];
                                                                    var booking_time = arr[0]['booking_time'];
    
                                                                    query = 'select * from innovation_zone_booking l where l.booking_date= ? and l.booking_time = ? and l.location="Computer 2" and l.stage="1"';
                                                                    connection.query(query, [booking_date, booking_time], (err, res)=>{
                                                                        if(err) throw err;
                                                                        if(Object.values(JSON.parse(JSON.stringify(res))).length <= 0){
                                                                            query = 'update innovation_zone_booking l set l.purpose="Simulation Software", l.software="Ansys", l.stage=1, l.booking_type="Simulation Software", l.location="Computer 2", l.e_items=?, l.comments=? where l.bitsid=? and l.stage="0"';
                                                                            connection.query(query, [e_items, comments, bitsid], (err, res)=>{
                                                                                if(err) throw err;
                                                                                resFinal.send({
                                                                                    seat: 2,
                                                                                    message: 'Thank you for sending your request. Your seating location is Computer 2'
                                                                                })
                                                                            })
                                                                        }
                                                                        else {
                                                                            query = 'select * from innovation_zone_booking l where l.bitsid= ? and l.stage="0"';
                                                                            connection.query(query, [bitsid], (err, res)=>{
                                                                                if(err) throw err;
                                                                                var arr = Object.values(JSON.parse(JSON.stringify(res)));
                                                                                var booking_date = arr[0]['booking_date'];
                                                                                var booking_time = arr[0]['booking_time'];
    
                                                                                query = 'select * from innovation_zone_booking l where l.booking_date= ? and l.booking_time = ? and l.location="Computer 3" and l.stage="1"';
                                                                                connection.query(query, [booking_date, booking_time], (err, res)=>{
                                                                                    if(err) throw err;
                                                                                    if(Object.values(JSON.parse(JSON.stringify(res))).length <= 0){
                                                                                        query = 'update innovation_zone_booking l set l.purpose="Simulation Software", l.software="Ansys", l.stage=1, l.booking_type="Simulation Software", l.location="Computer 3", l.e_items=?, l.comments=? where l.bitsid=? and l.stage="0"';
                                                                                        connection.query(query, [e_items, comments, bitsid], (err, res)=>{
                                                                                            if(err) throw err;
                                                                                            resFinal.send({
                                                                                                seat: 3,
                                                                                                message: 'Thank you for sending your request. Your seating location is Computer 3'
                                                                                            })
                                                                                        })
                                                                                    }
                                                                                    else {
    
                                                                                        query = 'select * from innovation_zone_booking l where l.bitsid= ? and l.stage="0"';
                                                                                        connection.query(query, [bitsid], (err, res)=>{
                                                                                            if(err) throw err;
                                                                                            var arr = Object.values(JSON.parse(JSON.stringify(res)));
                                                                                            var booking_date = arr[0]['booking_date'];
                                                                                            var booking_time = arr[0]['booking_time'];
    
                                                                                            query = 'select * from innovation_zone_booking l where l.booking_date= ? and l.booking_time = ? and l.location="Computer 4" and l.stage="1"';
                                                                                            connection.query(query, [booking_date, booking_time], (err, res)=>{
                                                                                                if(err) throw err;
                                                                                                if(Object.values(JSON.parse(JSON.stringify(res))).length <= 0){
                                                                                                    query = 'update innovation_zone_booking l set l.purpose="Simulation Software", l.software="Ansys", l.stage=1, booking_type="Simulation Software", l.location="Computer 4", l.e_items=?, l.comments=? where l.bitsid=? and l.stage="0"';
                                                                                                    connection.query(query, [e_items, comments, bitsid], (err, res)=>{
                                                                                                        if(err) throw err;
                                                                                                        resFinal.send({
                                                                                                            seat: 4,
                                                                                                            message: 'Thank you for sending your request. Your seating location is Computer 4'
                                                                                                        })
                                                                                                    })
                                                                                                }
                                                                                                //else no computer is available
                                                                                            })
                                                                                        })
                                                                                        
                                                                                    }
                                                                                })
                                                                            })
                                                                        }
                                                                    })
                                                                })
                                                            }
                                                        })
                                                    })
                                                }
                                            })
                                        })
                                    } else resFinal.send({
                                        err: -1,
                                        message: "Hi"
                                    })
                            }
                        })
                    })

                }

            })

        } else if(purpose == "Space"){
            query = 'use bitslib; select * from innovation_zone_booking l where l.bitsid= ? and l.stage="0"';
            connection.query(query, [bitsid], (err, res)=>{
                var arr = Object.values(JSON.parse(JSON.stringify(res)));
                var booking_date = arr[1][0]['booking_date'];
                var booking_time = arr[1][0]['booking_time'];

                var query = 'select * from innovation_zone_booking l where l.booking_date= ? and l.booking_time = ? and l.purpose="Innovation Zone Space" and l.stage="1"';
                connection.query(query, [booking_date, booking_time], (err ,res1)=>{
                    if(err) throw err;
                    var arr1 = Object.values(JSON.parse(JSON.stringify(res1)))
                    
                    var query = 'select * from innovation_zone_booking l where l.booking_date= ? and l.booking_time = ? and l.purpose="Simulation Software and Space" and l.stage="1"';
                    connection.query(query, [booking_date, booking_time], (err ,res2)=>{
                        if(err) throw err;
                        var arr2 = Object.values(JSON.parse(JSON.stringify(res2)))
                    
                        if(arr1.length > 0 || arr2.length > 0){			
                            query = 'delete from innovation_zone_booking l where l.booking_date=? and l.booking_time = ? and l.bitsid=? and l.stage="0"'; 
                            connection.query(query, [booking_date, booking_time, bitsid], (err, res)=>{
                                if(err) throw err;

                                resFinal.send({
                                    message:'Innovation Zone Space is already booked on your selected date and time.'
                                })
                            })

                        } else {
                            var topic = data.topic;
                            var p_no = data.p_no;
                            var e_items = data.e_items;
                            var comments = data.comment;

                            query = 'update innovation_zone_booking l set l.purpose="Innovation Zone Space", l.topic=?, l.p_no=?, l.stage=1, l.booking_type="Innovation Zone Space", l.e_items=?, l.comments=? where l.bitsid=? and l.stage="0"'
                            connection.query(query, [topic, p_no, e_items, comments, bitsid], (err, res)=>{
                                if(err) throw err;
                                resFinal.send({
										message:'Thank you for sending your request.We will get back to you soon.'
                                })
                            })
                        }
                    })
                })
            })

        } else if(purpose == "Simulation Software and Space"){
            
            var query = 'use bitslib; select * from innovation_zone_booking l where l.bitsid= ? and l.stage="0"';
            connection.query(query, [bitsid], (err, res)=>{
                if(err) throw err;
                var arr = Object.values(JSON.parse(JSON.stringify(res)));
                if(arr[1].length == 0){
                    resFinal.send({
                        err: -3
                    })
                } else {
                    var booking_date = arr[1][0]['booking_date'];
                    var booking_time = arr[1][0]['booking_time'];
    
                    query = 'select * from innovation_zone_booking l where l.booking_date= ? and l.booking_time = ? and l.purpose="Innovation Zone Space" and l.stage="1"';
                    connection.query(query, [booking_date, booking_time], (err, res)=>{
                        if(err) throw err;
                        var arr =  Object.values(JSON.parse(JSON.stringify(res)));
    
                        query = 'select * from innovation_zone_booking l where l.booking_date= ? and l.booking_time = ? and l.purpose="Simulation Software and Space" and l.stage="1"'
                        connection.query(query, [booking_date, booking_time], (err, res1)=>{
                            if(err) throw err;
                            var arr1 =  Object.values(JSON.parse(JSON.stringify(res1)));
    
                            if(arr.length > 0 || arr1.length > 0){
                                        query = 'delete from innovation_zone_booking l where l.booking_date=? and l.booking_time =? and l.bitsid=? and l.stage="0"'; 
                                        connection.query(query, [booking_date, booking_time, bitsid], (err, res)=>{
                                            if(err) throw err;
    
                                            resFinal.send({
                                                err: -2,
                                                message:'Innovation Zone Space are booked on your selected date and time.'
                                            });
                                        })
                            } else {
                                query = 'select * from innovation_zone_booking l where l.booking_date= ? and l.booking_time = ? and l.purpose="Simulation Software" and l.stage="1"';
                                connection.query(query, [booking_date, booking_time], (err, res)=>{
                                    if(err) throw err;
                                    arr =  Object.values(JSON.parse(JSON.stringify(res)));
                
                                    query = 'select * from innovation_zone_booking l where l.booking_date= ? and l.booking_time = ? and l.purpose="Simulation Software and Space" and stage="1"'
                                    connection.query(query, [booking_date, booking_time], (err, res1)=>{
                                        if(err) throw err;
                                        arr1 =  Object.values(JSON.parse(JSON.stringify(res1)));
                
                                        var arrComb = arr.concat(arr1);
                                        if(arrComb.length>=4){
                                                    query = 'delete from innovation_zone_booking l where l.booking_date=? and l.booking_time =? and l.bitsid=? and l.stage="0"'; 
                                                    connection.query(query, [booking_date, booking_time, bitsid], (err, res)=>{
                                                        if(err) throw err;
                
                                                        resFinal.send({
                                                            err: -3,
                                                            message:'All simulation Software computers are booked on your selected date and time.Please select different time slot.'
                                                        });
                                                    })
                                        } else {
                                            var topic=data.both_d_topic;
                                            var p_no=data.both_p_no;
                                            var software=data.both_software;
                                            var dep_name=data.dep_name;
                                            var f_code=data.f_code;
                                            var e_items=data.e_items;
                                            var comments=data.comment;
                                            if(software == 'Ansys'){
                                                var query = 'select * from innovation_zone_booking l where l.bitsid= ? and l.stage="0"';
                                                connection.query(query, [bitsid], (err, res)=>{
                                                    if(err) throw err;
                                                    var arr = Object.values(JSON.parse(JSON.stringify(res)));
                                                    console.log(arr);
                                                    var booking_date = arr[0]['booking_date'];
                                                    var booking_time = arr[0]['booking_time'];
    
                                                    query = 'select * from innovation_zone_booking l where l.booking_date= ? and l.booking_time = ? and l.software="Ansys" and stage="1"';
                                                    connection.query(query, [booking_date, booking_time], (err, res)=>{
                                                        if(err) throw err;
                                                        if(Object.values(JSON.parse(JSON.stringify(res))).length <= 0){
                                                            query = 'update innovation_zone_booking l set l.purpose="Simulation Software",  l.topic= ?, l.p_no= ?, l.software="Ansys", l.dep_name= ?, l.f_code= ?, stage=1, l.booking_type="Simulation Software", l.location="Computer 4", l.e_items=?, l.comments=? where l.bitsid=? and l.stage="0"';
                                                            connection.query(query, [topic, p_no, dep_name, f_code ,e_items, comments, bitsid], (err, res)=>{
                                                                if(err) throw err;
                                                                resFinal.send({
                                                                    seat: 4,
                                                                    message: 'Thank you for sending your request.Your seating location is Computer 4'
                                                                })
                                                            })
                                                        } else resFinal.send({
                                                            err: -4,
                                                            message: 'Ansys software is avaibale only in computer number 4, which is already booked. Please select different software for booking.'
                                                        })
                                                    })
                                                })
    
                                            } else { // TODO change it
                                                query = 'select * from innovation_zone_booking l where l.bitsid= ? and stage="0"';
                                                connection.query(query, [bitsid], (err, res)=>{
                                                    if(err) throw err;
                                                    var arr = Object.values(JSON.parse(JSON.stringify(res)));
                                                    var booking_date = arr[0]['booking_date'];
                                                    var booking_time = arr[0]['booking_time'];
    
                                                    query = 'select * from innovation_zone_booking l where l.booking_date= ? and l.booking_time = ? and l.location="Computer 1" and l.stage="1"';
                                                    connection.query(query, [booking_date, booking_time], (err, res)=>{
                                                        if(err) throw err;
                                                        if(Object.values(JSON.parse(JSON.stringify(res))).length <= 0){
                                                            query = 'update innovation_zone_booking l set l.purpose="Simulation Software and Space", topic=?, l.p_no=?, l.software=?, l.dep_name=?, l.f_code=?, l.stage=1, l.booking_type="Simulation Software and Space", l.location="Computer 1", l.e_items=?, l.comments=? where l.bitsid=? and l.stage="0"';
                                                            connection.query(query, [topic, p_no, software, dep_name, f_code, e_items, comments, bitsid], (err, res)=>{
                                                                if(err) throw err;
                                                                resFinal.send({
                                                                    seat: 1,
                                                                    message: 'Thank you for sending your request. Your seating location is Computer 1'
                                                                })
                                                            })
                                                        }
                                                        else {
                                                            query = 'select * from innovation_zone_booking l where l.bitsid= ? and l.stage="0"';
                                                            connection.query(query, [bitsid], (err, res)=>{
                                                                if(err) throw err;
                                                                var arr = Object.values(JSON.parse(JSON.stringify(res)));
                                                                var booking_date = arr[0]['booking_date'];
                                                                var booking_time = arr[0]['booking_time'];
    
                                                                query = 'select * from innovation_zone_booking l where l.booking_date= ? and l.booking_time = ? and l.location="Computer 2" and l.stage="1"';
                                                                connection.query(query, [booking_date, booking_time], (err, res)=>{
                                                                    if(err) throw err;
                                                                    if(Object.values(JSON.parse(JSON.stringify(res))).length <= 0){
                                                                        query = 'update innovation_zone_booking l set l.purpose="Simulation Software", l.software="Ansys", l.stage=1, l.booking_type="Simulation Software", l.location="Computer 2", l.e_items=?, l.comments=? where l.bitsid=? and l.stage="0"';
                                                                        connection.query(query, [e_items, comments, bitsid], (err, res)=>{
                                                                            if(err) throw err;
                                                                            resFinal.send({
                                                                                seat: 2,
                                                                                message: 'Thank you for sending your request. Your seating location is Computer 2'
                                                                            })
                                                                        })
                                                                    }
                                                                    else {
                                                                        query = 'select * from innovation_zone_booking l where l.bitsid= ? and l.stage="0"';
                                                                        connection.query(query, [bitsid], (err, res)=>{
                                                                            if(err) throw err;
                                                                            var arr = Object.values(JSON.parse(JSON.stringify(res)));
                                                                            var booking_date = arr[0]['booking_date'];
                                                                            var booking_time = arr[0]['booking_time'];
    
                                                                            query = 'select * from innovation_zone_booking l where l.booking_date= ? and l.booking_time = ? and l.location="Computer 3" and l.stage="1"';
                                                                            connection.query(query, [booking_date, booking_time], (err, res)=>{
                                                                                if(err) throw err;
                                                                                if(Object.values(JSON.parse(JSON.stringify(res))).length <= 0){
                                                                                    query = 'update innovation_zone_booking l set l.purpose="Simulation Software", l.software="Ansys", l.stage=1, l.booking_type="Simulation Software", l.location="Computer 3", l.e_items=?, l.comments=? where l.bitsid=? and l.stage="0"';
                                                                                    connection.query(query, [e_items, comments, bitsid], (err, res)=>{
                                                                                        if(err) throw err;
                                                                                        resFinal.send({
                                                                                            seat: 3,
                                                                                            message: 'Thank you for sending your request. Your seating location is Computer 3'
                                                                                        })
                                                                                    })
                                                                                }
                                                                                else {
    
                                                                                    query = 'select * from innovation_zone_booking l where l.bitsid= ? and l.stage="0"';
                                                                                    connection.query(query, [bitsid], (err, res)=>{
                                                                                        if(err) throw err;
                                                                                        var arr = Object.values(JSON.parse(JSON.stringify(res)));
                                                                                        var booking_date = arr[0]['booking_date'];
                                                                                        var booking_time = arr[0]['booking_time'];
    
                                                                                        query = 'select * from innovation_zone_booking l where l.booking_date= ? and l.booking_time = ? and l.location="Computer 4" and l.stage="1"';
                                                                                        connection.query(query, [booking_date, booking_time], (err, res)=>{
                                                                                            if(err) throw err;
                                                                                            if(Object.values(JSON.parse(JSON.stringify(res))).length <= 0){
                                                                                                query = 'update innovation_zone_booking l set l.purpose="Simulation Software", l.software="Ansys", stage=1, l.booking_type="Simulation Software", l.location="Computer 4", l.e_items=?, l.comments=? where l.bitsid=? and l.stage="0"';
                                                                                                connection.query(query, [e_items, comments, bitsid], (err, res)=>{
                                                                                                    if(err) throw err;
                                                                                                    resFinal.send({
                                                                                                        seat: 4,
                                                                                                        message: 'Thank you for sending your request. Your seating location is Computer 4'
                                                                                                    })
                                                                                                })
                                                                                            }
                                                                                            else resFinal.send({
                                                                                                err: -4
                                                                                            })
                                                                                        })
                                                                                    })
                                                                                    
                                                                                }
                                                                            })
                                                                        })
                                                                    }
                                                                })
                                                            })
                                                        }
                                                    })
                                                })
                                            }
                                        }
                                    })
                                })
                            }
                        })
                    })

                }

            })
        }

    } else resFinal.send({
        err: 0,
        message: 'Please select atleast one radio button option.'
    })
}

export function processCheck(req, resFinal){
    var data = req.body;
    var bitsid = data.bitsid;

    var query = 'use bitslib; select * from innovation_zone_booking where bitsid=? and stage="0"'
    connection.query(query, [bitsid], (err, res)=>{
        if(err) throw err;
        var array = Object.values(JSON.parse(JSON.stringify(res)));
        if(array[1].length > 0){
            var booking_date = array[1][0]['booking_date'];
            var booking_time = array[1][0]['booking_time'];
    
            query = 'select SUM(p_no) as total from innovation_zone_booking where booking_date= ? and booking_time = ? and stage="1"';
            connection.query(query, [booking_date, booking_time], (err, res)=>{
                if(err) throw err;
                var array = Object.values(JSON.parse(JSON.stringify(res)));
                var total = array[0].total;
                if(total == null)
                    resFinal.send({
                        number: 8
                    })
                else  
                    resFinal.send({
                        number: 8 - total
                    })
            })
        } else resFinal.send({
            err: -1
        })
    })
}

export default innovationRouter;