import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {User} from './models/User';
import configs from "./configs";
import {writeLog} from "./utils/logger"; // Assuming you have a User model

const MONGO_URI = configs.db.uri;

export const createDefaultUser = async () => {
    try {

        if(configs.default_user.email){
            const user = await User.findOne({
                email: configs.default_user.email
            });
            if(user){
                console.log("Default user already exists!");
                return;
            }else{
                const newUser = new User({
                    name: 'Default Admin',
                    email: configs.default_user.email,
                    password: bcrypt.hashSync(configs.default_user.password, 8),
                    userType: "admin",
                    nextAction: 'home',
                    status: 'active',
                    emailVerified: true
                });

                await newUser.save();
                console.log("Default user created!");
                writeLog('INFO', `Default user created!`);
                return;
            }
        }else{
            console.log("Skipping Default user creation as configured!");
            writeLog('INFO', `Skipping Default user creation as configured!`);
            return;
        }

    } catch (e) {
        console.log(e);
        writeLog('ERROR', `Error creating default user!`, JSON.stringify(e));
        return;
    }
};
