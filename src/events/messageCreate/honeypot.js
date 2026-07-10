"use strict"

const { Message, EmbedBuilder, Colors } = require('discord.js');
const config = require(`${PROJECT_ROOT}/config.json`);

/**
 * 
 * @param {Message} msg 
 */
module.exports = async (msg) => {
    let honeypotChannel = config.channels.honeypot[process.env.THIS_ENVIRONMENT];
    if (honeypotChannel && honeypotChannel === msg.channelId) {
        let server = msg.guild;
        let author = await server.members.fetch(msg.author.id);

        if (author.permissions.has("Administrator")) {
            return;
        }

        await server.bans.create(author, {
            reason: '[AUTO/SOFTBAN] Sent a message in the honeypot channel.',
            deleteMessageSeconds: 86400,
        });

        await server.bans.remove(author, '[AUTO/SOFTBAN] Sent a message in the honeypot channel.');

        let logChannel = await server.channels.fetch(config.channels.logging.modactions[process.env.THIS_ENVIRONMENT]);
        let logEmbed = new EmbedBuilder()
        .setTitle(`👨‍⚖️ Honeypot Catch`)
        .setDescription(`${msg.author} was softbanned after sending the following message in <#${honeypotChannel}>:`)
        .addFields({
            name: `Message`,
            value: msg.content,
        })
        .setImage((msg.attachments.size > 0) ? msg.attachments.first().url : null)
        .setColor(Colors.Yellow)
        .setTimestamp();

        await logChannel.send({embeds: [logEmbed]});
    }
}