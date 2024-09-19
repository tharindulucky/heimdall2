import {RequestHandler} from "express";
import Joi from "joi";
import {errorMessage} from "../interfaces/ErrorResponse";
import {User} from "../models/User";
import bcrypt from "bcryptjs";
import {writeLog} from "../utils/logger";
import {IUserFilter} from "../interfaces/types";

export const getUsers: RequestHandler = async (req, res) => {
    const schema = Joi.object({
        authUserId: Joi.string().required()
    }).options({abortEarly: false, errors: {label: false}});

    const {error} = schema.validate(req.body);
    if(error)
        return res.status(400).json({
            message: "Validation error",
            body: errorMessage(error)
        });

    const filter:IUserFilter = {};

    const page : number = (+(req.query.page) || 1) - 1;

    if(req.query.type && req.query.type !== '')
        filter.userType = req.query.type;

    if(req.query.search && req.query.search !== '')
        filter.name = { $regex: req.query.search, $options: 'i'};

    if(req.query.from_date && req.query.from_date !== '' && req.query.to_date && req.query.to_date !== '')
        filter.createdAt = {
            $gte: req.query.from_date + 'T23:59:59',
            $lte: req.query.to_date + 'T23:59:59',
        };

    try {
        const usersCount = await User.find(filter).countDocuments();
        const users = await User.find(filter)
            .select(['_id', 'email', 'name', 'userType', 'status', 'emailVerified', 'createdAt'])
            .sort({createdAt: 'desc'})
            .limit(50)
            .skip(50 * page);

        return res.status(200).json({
            message: "Success",
            body: {
                count: usersCount,
                users: users
            }
        });
    } catch (e) {
        console.log(e);
        writeLog('ERROR', `Something went wrong`, JSON.stringify(e));
        return res.status(500).json({
            message: "Something went wrong",
            body: e
        });
    }
}

export const getUser: RequestHandler = async (req, res) => {
    const bodySchema = Joi.object({
        authUserId: Joi.string().required()
    }).options({ abortEarly: false, errors: { label: false } });

    const paramsSchema = Joi.object({
        id: Joi.string().required()
    }).options({ abortEarly: false, errors: { label: false } });

    const { error: bodyError } = bodySchema.validate(req.body);
    const { error: queryError } = paramsSchema.validate(req.params);

    if (bodyError || queryError) {
        return res.status(400).json({
            message: "Validation error",
            body: bodyError ? errorMessage(bodyError) : null,
            query: queryError ? errorMessage(queryError) : null
        });
    }

    try {
        const user = await User.findOne({_id: req.params.id})
            .select(['_id', 'email', 'name', 'userType', 'status', 'emailVerified', 'createdAt']);

        return res.status(200).json({
            message: "Success",
            body: user
        });
    } catch (e) {
        console.log(e);
        writeLog('ERROR', `Something went wrong`, JSON.stringify(e));
        return res.status(500).json({
            message: "Something went wrong",
            body: e
        });
    }
}

export const getUserProfile: RequestHandler = async (req, res) => {
    const bodySchema = Joi.object({
        authUserId: Joi.string().required()
    }).options({ abortEarly: false, errors: { label: false } });

    const { error: bodyError } = bodySchema.validate(req.body);

    if (bodyError) {
        return res.status(400).json({
            message: "Validation error",
            body: bodyError ? errorMessage(bodyError) : null
        });
    }

    try {
        const user = await User.findOne({_id: req.body.authUserId})
            .select(['_id', 'email', 'name', 'userType', 'status', 'emailVerified', 'createdAt']);

        return res.status(200).json({
            message: "Success",
            body: user
        });
    } catch (e) {
        console.log(e);
        writeLog('ERROR', `Something went wrong`, JSON.stringify(e));
        return res.status(500).json({
            message: "Something went wrong",
            body: e
        });
    }
}

export const updateUserProfile: RequestHandler = async (req, res) => {
    const bodySchema = Joi.object({
        authUserId: Joi.string().required(),
        name: Joi.string().required()
    }).options({ abortEarly: false, errors: { label: false } });

    const { error: bodyError } = bodySchema.validate(req.body);

    if (bodyError) {
        return res.status(400).json({
            message: "Validation error",
            body: bodyError ? errorMessage(bodyError) : null
        });
    }

    try {
        const user = await User.findByIdAndUpdate(req.body.authUserId,
            {$set: {
                name: req.body.name
            }
            }, {new: true, runValidators: true}).select('_id name email userType status');

        return res.status(200).json({
            message: "Success",
            body: user
        });
    } catch (e) {
        console.log(e);
        writeLog('ERROR', `Something went wrong`, JSON.stringify(e));
        return res.status(500).json({
            message: "Something went wrong",
            body: e
        });
    }
}
