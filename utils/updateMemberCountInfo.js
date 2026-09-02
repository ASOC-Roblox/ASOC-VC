"use strict";

const { Guild } = require('discord.js');
const config = require(`${PROJECT_ROOT}/config.json`);

/**
 * @param {Guild} server
 * @returns {boolean}
 */
module.exports = async (server) => {
    if (server.id !== config.server[process.env.THIS_ENVIRONMENT]) return;

    const serverMemberList = await server.members.fetch();
    const allMembers = serverMemberList.size;
    const humanMembers = (serverMemberList.filter((check) => !check.user.bot)).size;

    const humansChannel = await server.channels.fetch(config.channels.serverstats.humans[process.env.THIS_ENVIRONMENT]);
    const allMembersChannel = await server.channels.fetch(config.channels.serverstats.all[process.env.THIS_ENVIRONMENT]);

    const newAllText = `【👥🤖】All Members: ${allMembers}`;
    const newHumansText = `【👥👥】Humans: ${humanMembers}`;

    await humansChannel.setName(newHumansText, `[AUTO] Updating member stats`);
    await allMembersChannel.setName(newAllText, `[AUTO] Updating member stats`);

    return (humansChannel.name === newHumansText && allMembersChannel.name === newAllText);
}