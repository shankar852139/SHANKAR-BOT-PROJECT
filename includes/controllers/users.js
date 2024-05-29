async function getNameUser(id) {
    try {
        if (global.data.userName.has(id)) {
            return global.data.userName.get(id);
        } else if (global.data.allUserID.includes(id)) {
            const userInfo = await this.getData(id);
            if (userInfo && userInfo.name) {
                global.data.userName.set(id, userInfo.name);
                return userInfo.name;
            } else {
                const apiUserInfo = await getInfo(id);
                if (apiUserInfo && apiUserInfo.name) {
                    global.data.userName.set(id, apiUserInfo.name);
                    return apiUserInfo.name;
                } else {
                    return "Unknown User";
                }
            }
        } else {
            const apiUserInfo = await getInfo(id);
            if (apiUserInfo && apiUserInfo.name) {
                global.data.userName.set(id, apiUserInfo.name);
                return apiUserInfo.name;
            } else {
                return "Unknown User";
            }
        }
    } catch (error) {
        console.error(error);
        return "Unknown User";
    }
}
