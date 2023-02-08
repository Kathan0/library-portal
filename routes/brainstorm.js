import express from 'express';
import {connection} from '../connection/connection.js';
const brainstormRouter = express.Router();

brainstormRouter
    .post('/submit', postSubmit)
    .post('/check', postCheck)

function postSubmit(req, res){
    var date = new Date();
    var data = req.body;

    var mobile = data.mobile;
    var topic = data.topic;
    var facility_type = data.facility_type;
    var booking_time = data.booking_time;
    var p_no = data.p_no;
    var booking_date = data.booking_date;

    var created_date = ("0" + date.getDate()).slice(-2)+'/'+("0" + (date.getMonth() + 1)).slice(-2)+'/'+date.getFullYear();
    var created_time = date.getSeconds()+':'+date.getMinutes()+':'+date.getHours();
    var bits_id = data.bits_id;
    if(typeof bits_id != 'undefined'){
            
        if(booking_date == '18/10/2022'){
            res.send({message:'Sorry! Brainstorm Room is already booked on your selected date.Therefore, you can not book this room.'})
        } else {
            var query = `SELECT * FROM users WHERE bits_id = ?`
            connection.query(query ,[bits_id],(err, user_res)=>{
                if(err) throw err;
                var user_arr = Object.values(JSON.parse(JSON.stringify(user_res)));
                var name = user_arr.name;
                var bitsid = user_arr.bitsid;
                var email = user_arr.email;

                query = `select * from av_room_booking where booking_date = ? and starting_time = ? and stage= "1";`;
                connection.query(query, [booking_date, booking_time], (err, av_res)=>{
                    if(err) throw err;

                    if(Object.values(JSON.parse(JSON.stringify(av_res))).length == 0){
                        query = 'select * from av_room_booking where stage="1" and bitsid= ? and booking_date= ?;';
                        connection.query(query, [bits_id, booking_date], (err, av_res2)=>{
                            if(err) throw err;
                            if(Object.values(JSON.parse(JSON.stringify(av_res2))).length > 0)
                            res.send({message: 'You can not book for more than one hour a day.<br/>Please select another date for a new booking.'});
                            else{
                                query = 'select date from av_room_booking_holiday where date = ?';
                                connection.query(query, [booking_date], (err, res)=>{
                                    if(err) throw err;
                                    if(Object.values(JSON.parse(JSON.stringify(res))).length > 0){
                                        query = 'select times from av_room_booking_holiday_times where times= ?;';
                                        connection.query(query, [booking_time], (err, res)=>{
                                            if(err) throw err;

                                            if(Object.values(JSON.parse(JSON.stringify(res))).length > 0)
                                            res.send({message: 'Sorry! Library is open till 06:00 PM only.Therefore, you can not book this room.'});

                                            else {
                                                if(typeof data.purpose != 'undefined'){
                                                    purpose = data.radio_purpose;
                                                    if(typeof data.checkbox_req != 'unbdefined' && typeof data.tea_require != 'undefined'){

                                                        requirements = data.checkbox_req;
                                                        tea_require = data.tea_require;
                                                        var chk = "";
                                                        for(var chk1 in requirements){
                                                            chk += `${chk1},`
                                                        }
                                                        query = `insert into av_room_booking(name, bitsid, email, mobile, purpose, topic, facility_type, booking_date, starting_time, ending_time, p_no,  requirements, status, created_date, created_time, stage, action_taken_by, snacks_type, payment, payment_approval, balcony_require, tea_require) values
                                                        (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`;
                                                        connection.query(query, [name, bits_id, email, mobile, purpose, topic, facility_type, booking_date, booking_time,"",p_no, chk, "pending", created_date, created_time, 1, "", "", "", "", "", tea_require], (err, res)=>{
                                                            if(err) throw err;
                                                            res.send({message:'Thank you for sending your request.We will get back to you soon.'})
                                                        })

                                                    } else if( typeof data.tea_require != 'undefined'){

                                                        tea_require = data.tea_require;
                                                        query = `insert into av_room_booking(name, bitsid, email, mobile, purpose, topic, facility_type, booking_date, starting_time, ending_time, p_no,  requirements, status, created_date, created_time, stage, action_taken_by, snacks_type, payment, payment_approval, balcony_require, tea_require) values
                                                        (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
                                                        connection.query(query, [name, bits_id, email, mobile, purpose, topic, facility_type, booking_date, booking_time, , "", p_no, "", "pending", created_date, created_time, 1, "", "", "", "", "", tea_require], (err, res)=>{
                                                            if(err) throw err;
                                                            res.send({message: 'Thank you for sending your request.We will get back to you soon.'})
                                                        })

                                                    } else {
                                                        requirements = data.checkbox_req;
                                                        var chk = "";
                                                        for(var chk1 in requirements){
                                                            chk += `${chk1},`
                                                        }
                                                        query = `insert into av_room_booking(name, bitsid, email, mobile, purpose, topic, facility_type, booking_date, starting_time, ending_time, p_no,  requirements, status, created_date, created_time, stage, action_taken_by, snacks_type, payment, payment_approval, balcony_require, tea_require) values
                                                        (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`;
                                                        connection.query(query, [name, bits_id, email, mobile, purpose, topic, facility_type, booking_date, booking_time, "", p_no, chk, "pending", created_date, created_time, 1, "", "", "", "", "", "",], (err, res)=>{
                                                            if(err) throw err
                                                            res.send({message: 'Thank you for sending your request.We will get back to you soon.'})
                                                        })
                                                    }
                                                }
                                                else res.send({message: 'Please select your purpose for booking'});
                                            }
                                        })
                                    }
                                    else{
                                        
                                        if(typeof data.purpose != 'undefined'){
                                            purpose = data.radio_purpose;
                                            if(typeof data.checkbox_req != 'unbdefined' && typeof data.tea_require != 'undefined'){

                                                requirements = data.checkbox_req;
                                                tea_require = data.tea_require;
                                                var chk = "";
                                                for(var chk1 in requirements){
                                                    chk += `${chk1},`
                                                }
                                                query = `insert into av_room_booking(name, bitsid, email, mobile, purpose, topic, facility_type, booking_date, starting_time, ending_time, p_no,  requirements, status, created_date, created_time, stage, action_taken_by, snacks_type, payment, payment_approval, balcony_require, tea_require) values
                                                (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`;
                                                connection.query(query, [name, bits_id, email, mobile, purpose, topic, facility_type, booking_date, booking_time,"",p_no, chk, "pending", created_date, created_time, 1, "", "", "", "", "", tea_require], (err, res)=>{
                                                    if(err) throw err;
                                                    res.send({message:'Thank you for sending your request.We will get back to you soon.'})
                                                })

                                            } else if( typeof data.tea_require != 'undefined'){

                                                tea_require = data.tea_require;
                                                query = `insert into av_room_booking(name, bitsid, email, mobile, purpose, topic, facility_type, booking_date, starting_time, ending_time, p_no,  requirements, status, created_date, created_time, stage, action_taken_by, snacks_type, payment, payment_approval, balcony_require, tea_require) values
                                                (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
                                                connection.query(query, [name, bits_id, email, mobile, purpose, topic, facility_type, booking_date, booking_time, , "", p_no, "", "pending", created_date, created_time, 1, "", "", "", "", "", tea_require], (err, res)=>{
                                                    if(err) throw err;
                                                    res.send({message: 'Thank you for sending your request.We will get back to you soon.'})
                                                })

                                            } else {
                                                requirements = data.checkbox_req;
                                                var chk = "";
                                                for(var chk1 in requirements){
                                                    chk += `${chk1},`
                                                }
                                                query = `insert into av_room_booking(name, bitsid, email, mobile, purpose, topic, facility_type, booking_date, starting_time, ending_time, p_no,  requirements, status, created_date, created_time, stage, action_taken_by, snacks_type, payment, payment_approval, balcony_require, tea_require) values
                                                (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`;
                                                connection.query(query, [name, bits_id, email, mobile, purpose, topic, facility_type, booking_date, booking_time, "", p_no, chk, "pending", created_date, created_time, 1, "", "", "", "", "", "",], (err, res)=>{
                                                    if(err) throw err
                                                    res.send({message: 'Thank you for sending your request.We will get back to you soon.'})
                                                })
                                            }
                                        }
                                    }
                                })
                            }
                        })
                    } else res.send({$message:'Brainstorm Room is already booked on your selected date and time.Please select different time slot.'})
                })
            })    
        }  
    } else {
        res.send({message:'Sorry! Either you have not logged in or your session has expired'})
	}
}

function postCheck(req, res){
    var data = req.body; 
    var date = data.date;

    query = `
    select av.booking_date, av.starting_time 
    from av_room_booking av 
    where booking_date= ? and stage="1" `;
    connection.query(query, date,(err, res1)=>{
        if(err) throw err;
        var array = Object.values(JSON.parse(JSON.stringify(res1)))
        if(array.length > 0){
            res.send({
                array: array
            });
        }
        else {
            res.send({
                array:[],
                message: "You can select any time between 09:00AM to 06:00PM"
            })
        }
    })
}

export default brainstormRouter;