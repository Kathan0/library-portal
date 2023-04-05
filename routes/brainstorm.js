import express from 'express';
import {connection} from '../connection/connection.js';
const brainstormRouter = express.Router();

brainstormRouter
    .post('/submit', postSubmit)
    .post('/check', postCheck)

function postSubmit(req, resFinal){
    var date = new Date();
    var data = req.body;

    var mobile = data.mobile;
    var topic = data.topic;
    var facility_type = data.facility_type;
    var booking_time = data.booking_time;
    var p_no = data.p_no;
    var booking_date = data.booking_date;

    var created_date = ("0" + date.getDate()).slice(-2)+'/'+("0" + (date.getMonth() + 1)).slice(-2)+'/'+date.getFullYear();
    var created_time = date.getHours()+":"+date.getMinutes()+':'+date.getSeconds();
    if(typeof data.bitsid != 'undefined'){
        var bitsid = data.bitsid;
            
        if(booking_date == "18/10/2022"){

            resFinal.send({message:'Sorry! Brainstorm Room is already booked on your selected date.Therefore, you can not book this room.'})
        } else {

            var query = `USE bitslib; SELECT * FROM users u WHERE u.bitsid = ?`
            connection.query(query ,[bitsid],(err, user_res)=>{
                if(err) throw err;

                var user_arr = Object.values(JSON.parse(JSON.stringify(user_res)));
                var name = user_arr[1][0].name;
                var bitsid = user_arr[1][0].bitsid;
                var email = user_arr[1][0].email;

                query = `select * from av_room_booking av where av.booking_date = ? and av.starting_time = ? and av.stage= "1";`;
                connection.query(query, [booking_date, booking_time], (err, av_res)=>{
                    if(err) throw err;

                    if(Object.values(JSON.parse(JSON.stringify(av_res))).length == 0){

                        query = 'select * from av_room_booking av where av.stage="1" and av.bitsid= ? and av.booking_date= ?;';
                        connection.query(query, [bitsid, booking_date], (err, av_res2)=>{
                            if(err) throw err;
                            if(Object.values(JSON.parse(JSON.stringify(av_res2))).length > 0)
                            resFinal.send({message: 'You can not book for more than one hour a day.<br/>Please select another date for a new booking.'});
                            else{
                                query = 'select date from av_room_booking_holiday av where av.date = ?';
                                connection.query(query, [booking_date], (err, res)=>{
                                    if(err) throw err;
                                    if(Object.values(JSON.parse(JSON.stringify(res))).length > 0){
                                        
                                        query = 'select times from av_room_booking_holiday_times av where av.times= ?;';
                                        connection.query(query, [booking_time], (err, res)=>{
                                            if(err) throw err;

                                            if(Object.values(JSON.parse(JSON.stringify(res))).length > 0)
                                            resFinal.send({message: 'Sorry! Library is open till 06:00 PM only. Therefore, you can not book this room.'});

                                            else {
                                                if(typeof data.radio_purpose != 'undefined'){
                                                    var purpose = data.radio_purpose;
                                                    if(typeof data.checkbox_req != 'undefined' && typeof data.tea_require != 'undefined'){

                                                        var requirements = data.checkbox_req;
                                                        var tea_require = data.tea_require;
                                                        var chk = "";
                                                        for(var chk1 in requirements){
                                                            chk += `${chk1},`
                                                        }
                                                        query = `insert into av_room_booking(name, bitsid, email, mobile, purpose, topic, facility_type, booking_date, starting_time, ending_time, p_no,  requirements, status, created_date, created_time, stage, action_taken_by, snacks_type, payment, payment_approval, balcony_require, tea_require) values
                                                        (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`;
                                                        connection.query(query, [name, bitsid, email, mobile, purpose, topic, facility_type, booking_date, booking_time,"",p_no, chk, "pending", created_date, created_time, 1, "", "", "", "", "", tea_require], (err, res)=>{
                                                            if(err) throw err;
                                                            resFinal.send({message:'Thank you for sending your request.We will get back to you soon.'})
                                                        })

                                                    } else if( typeof data.tea_require != 'undefined'){

                                                        tea_require = data.tea_require;
                                                        query = `insert into av_room_booking(name, bitsid, email, mobile, purpose, topic, facility_type, booking_date, starting_time, ending_time, p_no,  requirements, status, created_date, created_time, stage, action_taken_by, snacks_type, payment, payment_approval, balcony_require, tea_require) values
                                                        (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
                                                        connection.query(query, [name, bitsid, email, mobile, purpose, topic, facility_type, booking_date, booking_time, , "", p_no, "", "pending", created_date, created_time, 1, "", "", "", "", "", tea_require], (err, res)=>{
                                                            if(err) throw err;
                                                            resFinal.send({message: 'Thank you for sending your request.We will get back to you soon.'})
                                                        })

                                                    } else {
                                                        requirements = data.checkbox_req;
                                                        var chk = "";
                                                        for(var chk1 in requirements){
                                                            chk += `${chk1},`
                                                        }
                                                        query = `insert into av_room_booking(name, bitsid, email, mobile, purpose, topic, facility_type, booking_date, starting_time, ending_time, p_no,  requirements, status, created_date, created_time, stage, action_taken_by, snacks_type, payment, payment_approval, balcony_require, tea_require) values
                                                        (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`;
                                                        connection.query(query, [name, bitsid, email, mobile, purpose, topic, facility_type, booking_date, booking_time, "", p_no, chk, "pending", created_date, created_time, 1, "", "", "", "", "", "",], (err, res)=>{
                                                            if(err) throw err
                                                            resFinal.send({message: 'Thank you for sending your request.We will get back to you soon.'})
                                                        })
                                                    }
                                                }
                                                else resFinal.send({message: 'Please select your purpose for booking'});
                                            }
                                        })
                                    }
                                    else{
                                        
                                        if(typeof data.radio_purpose != 'undefined'){
                                            var purpose = data.radio_purpose;
                                            if(typeof data.checkbox_req != 'unbdefined' && typeof data.tea_require != 'undefined'){

                                                var requirements = data.checkbox_req;
                                                var tea_require = data.tea_require;
                                                var chk = "";
                                                for(var chk1 in requirements){
                                                    chk += `${chk1},`
                                                }
                                                query = `insert into av_room_booking(name, bitsid, email, mobile, purpose, topic, facility_type, booking_date, starting_time, ending_time, p_no,  requirements, status, created_date, created_time, stage, action_taken_by, snacks_type, payment, payment_approval, balcony_require, tea_require) values
                                                (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`;
                                                connection.query(query, [name, bitsid, email, mobile, purpose, topic, facility_type, booking_date, booking_time,"",p_no, chk, "pending", created_date, created_time, 1, "", "", "", "", "", tea_require], (err, res)=>{
                                                    if(err) throw err;
                                                    resFinal.send({message:'Thank you for sending your request.We will get back to you soon.'})
                                                })

                                            } else if( typeof data.tea_require != 'undefined'){

                                                var tea_require = data.tea_require;
                                                query = `insert into av_room_booking(name, bitsid, email, mobile, purpose, topic, facility_type, booking_date, starting_time, ending_time, p_no,  requirements, status, created_date, created_time, stage, action_taken_by, snacks_type, payment, payment_approval, balcony_require, tea_require) values
                                                (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
                                                connection.query(query, [name, bitsid, email, mobile, purpose, topic, facility_type, booking_date, booking_time, , "", p_no, "", "pending", created_date, created_time, 1, "", "", "", "", "", tea_require], (err, res)=>{
                                                    if(err) throw err;
                                                    resFinal.send({message: 'Thank you for sending your request.We will get back to you soon.'})
                                                })

                                            } else {
                                                var requirements = data.checkbox_req;
                                                var chk = "";
                                                for(var chk1 in requirements){
                                                    chk += `${chk1},`
                                                }
                                                query = `insert into av_room_booking(name, bitsid, email, mobile, purpose, topic, facility_type, booking_date, starting_time, ending_time, p_no,  requirements, status, created_date, created_time, stage, action_taken_by, snacks_type, payment, payment_approval, balcony_require, tea_require) values
                                                (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`;
                                                connection.query(query, [name, bitsid, email, mobile, purpose, topic, facility_type, booking_date, booking_time, "", p_no, chk, "pending", created_date, created_time, 1, "", "", "", "", "", "",], (err, res)=>{
                                                    if(err) throw err
                                                    resFinal.send({message: 'Thank you for sending your request.We will get back to you soon.'})
                                                })
                                            }
                                        }
                                    }
                                })
                            }
                        })
                    } else resFinal.send({message:'Brainstorm Room is already booked on your selected date and time.Please select different time slot.'})
                })
            })    
        }  
    } else {
        resFinal.send({message:'Sorry! Either you have not logged in or your session has expired'})
	}
}

function postCheck(req, resFinal){
    var data = req.body; 
    var date = data.date;

    var query = `USE bitslib;
    select av.booking_date, av.starting_time 
    from av_room_booking av 
    where booking_date= ? and stage="1" `;
    connection.query(query, date,(err, res1)=>{
        if(err) throw err;
        var array = Object.values(JSON.parse(JSON.stringify(res1)))
        if(array[1].length > 0){
            resFinal.send({
                array: array[1]
            });
        }
        else {
            resFinal.send({
                array:[],
                message: "You can select any time between 09:00AM to 06:00PM"
            })
        }
    })
}

export default brainstormRouter;