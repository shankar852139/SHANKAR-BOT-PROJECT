module.exports = function ({ models, api }) {
    const Users = models.use('Users');

    async function getInfo(id) {
        try {
            const info = (await api.getUserInfo(id))[id];
            console.log(`getInfo: Retrieved info for user ID ${id}`);
            return info;
        } catch (error) {
            console.error(`getInfo: Error fetching info for user ID ${id}`, error);
            throw error;
        }
    }

    async function getNameUser(id) {
        try {
            if (global.data.userName.has(id)) {
                console.log(`getNameUser: Found in global data: ${id}`);
                return global.data.userName.get(id);
            } else if (global.data.allUserID.includes(id)) {
                console.log(`getNameUser: Fetching from database: ${id}`);
                const userData = await this.getData(id);
                if (userData && userData.name) {
                    global.data.userName.set(id, userData.name);  // Optionally update global data
                    return userData.name;
                } else {
                    console.log(`getNameUser: Name not found in database: ${id}`);
                    return "Facebook User";
                }
            } else {
                console.log(`getNameUser: User ID not found globally: ${id}`);
                return "Facebook User";
            }
        } catch (error) {
            console.error(`getNameUser: Error fetching name for ID ${id}:`, error);
            return "Facebook User";
        }
    }

    async function getAll(...data) {
        try {
            var where, attributes;
            for (const i of data) {
                if (typeof i != 'object') throw global.getText("users", "needObjectOrArray");
                if (Array.isArray(i)) attributes = i;
                else where = i;
            }
            const result = (await Users.findAll({ where, attributes })).map(e => e.get({ plain: true }));
            console.log(`getAll: Retrieved all users with data: ${JSON.stringify(data)}`);
            return result;
        } catch (error) {
            console.error(`getAll: Error fetching all users with data ${JSON.stringify(data)}`, error);
            throw error;
        }
    }

    async function getData(userID) {
        try {
            const data = await Users.findOne({ where: { userID } });
            if (data) {
                console.log(`getData: Retrieved data for user ID ${userID}`);
                return data.get({ plain: true });
            } else {
                console.log(`getData: No data found for user ID ${userID}`);
                return false;
            }
        } catch (error) {
            console.error(`getData: Error fetching data for user ID ${userID}`, error);
            throw error;
        }
    }

    async function setData(userID, options = {}) {
        if (typeof options != 'object' && !Array.isArray(options)) throw global.getText("users", "needObject");
        try {
            const user = await Users.findOne({ where: { userID } });
            if (user) {
                await user.update(options);
                console.log(`setData: Updated data for user ID ${userID}`);
            } else {
                await this.createData(userID, options);
                console.log(`setData: Created data for user ID ${userID}`);
            }
            return true;
        } catch (error) {
            console.error(`setData: Error setting data for user ID ${userID}`, error);
            throw error;
        }
    }

    async function delData(userID) {
        try {
            const user = await Users.findOne({ where: { userID } });
            if (user) {
                await user.destroy();
                console.log(`delData: Deleted data for user ID ${userID}`);
                return true;
            } else {
                console.log(`delData: No data found to delete for user ID ${userID}`);
                return false;
            }
        } catch (error) {
            console.error(`delData: Error deleting data for user ID ${userID}`, error);
            throw error;
        }
    }

    async function createData(userID, defaults = {}) {
        if (typeof defaults != 'object' && !Array.isArray(defaults)) throw global.getText("users", "needObject");
        try {
            await Users.findOrCreate({ where: { userID }, defaults });
            console.log(`createData: Created data for user ID ${userID}`);
            return true;
        } catch (error) {
            console.error(`createData: Error creating data for user ID ${userID}`, error);
            throw error;
        }
    }

    return {
        getInfo,
        getNameUser,
        getAll,
        getData,
        setData,
        delData,
        createData
    };
};

// Example of initializing global data (this part should be in your application startup code)
global.data = {
    userName: new Map(),
    allUserID: []
};

// Example function to populate global data from the database
async function populateGlobalData() {
    try {
        const users = await Users.findAll();
        users.forEach(user => {
            global.data.userName.set(user.userID, user.name);
            global.data.allUserID.push(user.userID);
        });
        console.log('Global data initialized');
    } catch (error) {
        console.error('Error initializing global data:', error);
    }
}

// Call this function at the startup of your application
populateGlobalData();
