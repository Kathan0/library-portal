import express from 'express';
import {connection} from '../connection/connection.js';

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const crypto = require('crypto');

const loginRouter = express.Router();

loginRouter
    .post('/', postLogin)
    .post('/register', postRegister) // ONLY FOR TESTING! Remove before submission

export function postLogin(req, resFinal){    
    var data = req.body;
    var username = data.username;
    var pswd = data.password;

    var query = "use bitslib; select * from users u where u.bitsid= ? ;";
        connection.query(query, [username], (err, res1)=>{
            if(err) throw err;
            var arr = Object.values(JSON.parse(JSON.stringify(res1)));
            if(arr[1].length > 0){
                const hash = crypto.createHash('sha1').update(pswd).digest('hex') // remove if sending encrypted password
                if(arr[1][0].password == hash){ // and replace 'hash' with 'pswd'
                    if(arr[1][0]['confirm'] == 1){

                        if(arr[1][0]['category'] == "Admin"){
                            resFinal.set('location', 'administrator/admin.php');
                            resFinal.send({
                                suc: 0,
                                message: "Hello Admin"
                            })
                        }
                        else {
                            resFinal.set('location', 'account/dashboard.php');
                            resFinal.send({
                                suc: 1,
                                message: "Hello student"
                            });
                        }

                    } else {

                        resFinal.send({err: -1,
                            message : 	
                            `Please confirm your BITS Email to Access Your Dashboard and Library Services`});
                    }

                } else resFinal.send({err: 0, message: 'Invalid credentials'});

            } else resFinal.send({message: 'Please Sign up first then login'});
        })
}



export function postRegister(req, resFinal, next){ // ONLY FOR TESTING! Remove before submission
    var data = req.body;
    var date = new Date();

    var username = data.username;
    var pswd = data.password;
    var category = data.category;
    var avatar = data.avatar;
    var created_date = date.getFullYear()+'-'+("0" + (date.getMonth() + 1)).slice(-2)+'-'+("0" + date.getDate()).slice(-2);


    var query = 'use bitslib; select * from users u where u.bitsid = ?';
        connection.query(query, [username], (err, res1)=>{
            if(err) throw err;
            var arr = Object.values(JSON.parse(JSON.stringify(res1)));
            if(arr[1].length == 0){
                pswd = crypto.createHash('sha1').update(pswd).digest('hex');
                query = 'insert into users(bitsid, password, confirm, category, avatar, signup_date, confirm_code) values(?,?,?,?,?,?,?)'
                connection.query(query, [username, pswd, 1, category, avatar, created_date, "confirm_code==?"], (err, result)=>{
                    if(err) throw err;
                    resFinal.send({message: 'Successful', pswd: pswd})
                })
            } else {
                resFinal.send({message: 'Already exists'});
            }
        })
}



export default loginRouter;