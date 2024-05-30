module.exports.config = {
    name: "typing",
    version: "1.0.0",
    hasPermission: 0,
    credits: "SHANKAR SUMAN",
    description: "Simulate typing on Messenger",
    commandCategory: "Miscellaneous",
    cooldowns: 0,
};

module.exports.run = function({ api, event, client, __GLOBAL }) {
    api.sendMessage({ typing: true }, event.threadID);
};
