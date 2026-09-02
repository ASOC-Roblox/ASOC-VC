"use strict";

const { ActivityType, Client } = require('discord.js');
const config = require(`${PROJECT_ROOT}/config.json`);
const updateMemberCountInfo = require(`${PROJECT_ROOT}/utils/updateMemberCountInfo.js`);
const { sleep } = require(`${PROJECT_ROOT}/utils/coreUtils.js`);

/**
 * 
 * @param {Client} bot 
 */
module.exports = async (bot) => {
    console.log(`Logged into ${bot.user.username} successfully!`)
    bot.user.setPresence({
        activities: [{
            name: 'Army Special Operations Command',
            type: ActivityType.Watching,
        }],
        status: 'online'
    })

    // Update member stats counter upon activation (to account for any potential joins / leaves that may have occured)
    const serverInfo = await bot.guilds.fetch(config.server[process.env.THIS_ENVIRONMENT]);
    let success = false;
    while (!success) {
        try {
            success = await updateMemberCountInfo(serverInfo);
        } catch (e) {
            console.log(`Channel update failed! Retrying...`);
            sleep(5_000);
        }
    }
}