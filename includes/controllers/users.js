module.exports = function ({ models, api }) {
    const Users = models.use('Users');

    async function getInfo(id) {
        return (await api.getUserInfo(id))[id];
    }

    async function getNameUser(id) {
        try {
            if (global.data.userName.has(id)) {
                console.log(`Found in global data: ${id}`);
                return global.data.userName.get(id);
            } else if (global.data.allUserID.includes(id)) {
                console.log(`Fetching from database: ${id}`);
                const userData = await this.getData(id);
                if (userData && userData.name) {
                    global.data.userName.set(id, userData.name);  // Optionally update global data
                    return userData.name;
                } else {
                    console.log(`Name not found in database: ${id}`);
                    return "Facebook User";
                }
            } else {
                console.log(`User ID not found globally: ${id}`);
                return "Facebook User";
            }
        } catch (error) {
            console.error(`Error fetching name for ID ${id}:`, error);
            return "Facebook User";
        }
    }

    async function getAll(...data) {
        var where, attributes;
        for (const i of data) {
            if (typeof i != 'object') throw global.getText("users", "needObjectOrArray");
            if (Array.isArray(i)) attributes = i;
            else where = i;
        }
        try {
            return (await Users.findAll({ where, attributes })).map(e => e.get({ plain: true }));
        } catch (error) {
            console.error(error);
            throw new Error(error);
        }
    }

    async function getData(userID) {
        try {
            const data = await Users.findOne({ where: { userID } });
            if (data) return data.get({ plain: true });
            else return false;
        } catch (error) {
            console.error(error);
            throw new Error(error);
        }
    }

    async function setData(userID, options = {}) {
        if (typeof options != 'object' && !Array.isArray(options)) throw global.getText("users", "needObject");
        try {
            const user = await Users.findOne({ where: { userID } });
            if (user) {
                await user.update(options);
            } else {
                await this.createData(userID, options);
            }
            return true;
        } catch (error) {
            console.error(error);
            throw new Error(error);
        }
    }

    async function delData(userID) {
        try {
            const user = await Users.findOne({ where: { userID } });
            if (user) {
                await user.destroy();
                return true;
            }
            return false;
        } catch (error) {
            console.error(error);
            throw new Error(error);
        }
    }

    async function createData(userID, defaults = {}) {
        if (typeof defaults != 'object' && !Array.isArray(defaults)) throw global.getText("users", "needObject");
        try {
            await Users.findOrCreate({ where: { userID }, defaults });
            return true;
        } catch (error) {
            console.error(error);
            throw new Error(error);
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
    const users = await Users.findAll();
    users.forEach(user => {
        global.data.userName.set(user.userID, user.name);
        global.data.allUserID.push(user.userID);
    });
}

// Call this function at the startup of your application
populateGlobalData().then(() => {
    console.log('Global data initialized');
}).catch(error => {
    console.error('Error initializing global data:', error);
});
