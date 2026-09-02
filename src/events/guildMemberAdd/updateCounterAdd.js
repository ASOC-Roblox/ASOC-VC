"use strict";

const { GuildMember } = require(`discord.js`);
const config = require(`${PROJECT_ROOT}/config.json`);
const updateMemberCountInfo = require(`${PROJECT_ROOT}/utils/updateMemberCountInfo.js`);
const { sleep } = require(`${PROJECT_ROOT}/utils/coreUtils.js`);

/**
 * @param {GuildMember} member 
 */
module.exports = async (member) => {
    const serverInfo = member.guild;
    if (serverInfo.id !== config.server[process.env.THIS_ENVIRONMENT]) return;

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