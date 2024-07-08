const { users } = require("../models/index");
const { parseUserData } = require("./utils/restapis-utils");
const { newUserId } = require("./utils/misc-utils");

const getAllUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const items = parseInt(req.query.items) || 15;
        const filter = req.query.filter;
        const category = req.query.category;
        const skip = (page - 1) * items;

        let query = {};

        if (filter) {
            query.isactive = filter;
        }
        if (category) {
            query.department = category;
        }

        let userQuery;
        let totalUsers;

        if (Object.keys(query).length > 0) {
            userQuery = users.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(items);
            totalUsers = users.find(query).countDocuments();
        } else {
            userQuery = users.find({})
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(items);
            totalUsers = users.find({}).countDocuments();
        }

        const [usersList, totalCount] = await Promise.all([userQuery, totalUsers]);

        res.status(200).json({
            usersList,
            totalUsers: totalCount,
        });
    } catch (error) {
        next(error);
    }
};


const getUser = async (req, res, next) => {
    const { id } = req.params;
    let user = await users.find()
        .sort({ createdAt: -1 })
        .skip(0)
        .limit(15);
    res.status(200).json(id);
}

const addUser = async (req, res, next) => {
    const user = parseUserData(req);
    const internalId = newUserId();
    const { firstName, lastName, middleName, email, department, accessLevel, role } = req.body;

    try {
        await users.create({
            internalid: internalId,
            firstname: firstName,
            lastname: lastName,
            middlename: middleName,
            email: email,
            password: user.id,
            image: "default.jpg",
            role: role,
            accesslevel: parseInt(accessLevel),
            isactive: true,
            department: department,
            createby: `${user.firstname} ${user.lastname}`,
            updatedby: `${user.firstname} ${user.lastname}`,
        });

        res.status(200).json({ success: true });
    } catch (error) {
        next(error);
        res.status(500).json({ success: false, error: 'Error saving user' });
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const result = await users.deleteOne({ internalid: id });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({
            message: 'User deleted successfully',
            Id: id,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = { getAllUsers, getUser, addUser, deleteUser };