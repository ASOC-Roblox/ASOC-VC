"use strict";

const { EmbedBuilder, SlashCommandBuilder, Colors, MessageFlags, ChatInputCommandInteraction, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const UserStats = require(`${PROJECT_ROOT}/data/UserStats`);
const config = require(`${PROJECT_ROOT}/config.json`);

/**
 * @param {number} n
 * @returns {EmbedBuilder} 
 */
async function getDisplayEmbed(n) {
    let users = await UserStats.find({promoPoints: {$gt: 0}}).sort({ promoPoints: -1 });

    let totalPages = Math.ceil(users.length / 10);
    if (n === "last") n = totalPages;
    let page = Math.min(Math.max(n, 1), totalPages);
    let startPaging = ((page - 1) * 10);
    let endPaging = Math.min(((page * 10) - 1), users.length - 1);

    let sendEmbed = new EmbedBuilder()
    .setTitle(`🏅 Promotion Points Leaderboard`)
    .setColor(Colors.Yellow)
    .setTimestamp();

    const EMOJI_MEDALS = [`🥇`, `🥈`, `🥉`];
    let fieldDescription = ``;
    for (let i = startPaging; i <= endPaging; i++) {
        fieldDescription += `${(i <= 2) ? `${EMOJI_MEDALS[i]} ` : ""}**#${i+1}:** <@${users[i].discordId}> - ${config.emojis.misc["promotion-points"][process.env.THIS_ENVIRONMENT]}${users[i].promoPoints}\n`;
    }

    sendEmbed.addFields({
        name: `Page ${page}/${totalPages}`,
        value: fieldDescription,
    });

    return sendEmbed;
}

module.exports = {
    data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Gets leaderboard stats for total Promotion Points.')
    .addIntegerOption(opt =>
        opt.setName('page')
        .setDescription('The page to check. Defaults to page 1.')
        .setRequired(false)
    ),

    /**
     * @param {Object} param0 
     * @param {ChatInputCommandInteraction} param0.interaction
     */
    run: async ({ interaction }) => {
        try {
            let initPage = interaction.options.getInteger('page') ?? 1;
            let users = await UserStats.find({promoPoints: {$gt: 0}}).sort({ promoPoints: -1 });

            let totalPages = Math.ceil(users.length / 10);

            const leaderboardOptions = [
                {id: 'first', emoji: '◀️'},
                {id: 'back', emoji: '⬅️'},
                {id: 'refresh', emoji: '🔄'},
                {id: 'forward', emoji: '➡️'},
                {id: 'last', emoji: '▶️'}
            ]

            const buttons = leaderboardOptions.map((each) => {
                return new ButtonBuilder()
                .setCustomId(each.id)
                .setStyle(ButtonStyle.Primary)
                .setEmoji(each.emoji)
            })

            const actionRowButtons = new ActionRowBuilder().addComponents(buttons)

            let firstEmbed = await getDisplayEmbed(initPage);
            let response = await interaction.reply({
                embeds: [firstEmbed],
                components: [actionRowButtons],
            })

            let currentPage = initPage;
            const collector = response.createMessageComponentCollector({time: 3_600_000});
            collector.on('collect', async (i) => {
                if (i.user.id !== interaction.user.id) {
                    let embed = new EmbedBuilder()
                    .setTitle(`⛔ Access Denied`)
                    .setDescription(`You did not issue this command, therefore you cannot interact with the buttons.`)
                    .setColor(Colors.Black)
                    .setTimestamp();

                    return await i.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
                }

                switch (i.customId) {
                    case 'first': {
                        currentPage = 1;
                        let embed = await getDisplayEmbed(currentPage);
                        await interaction.editReply({embeds: [embed]});

                        if (i) await (await i.reply({content: `temp`, flags: MessageFlags.Ephemeral})).delete();
                        break;
                    }

                    case 'back': {
                        currentPage = Math.max(currentPage - 1, 1);
                        let embed = await getDisplayEmbed(currentPage);
                        await interaction.editReply({embeds: [embed]});

                        if (i) await (await i.reply({content: `temp`, flags: MessageFlags.Ephemeral})).delete();
                        break;
                    }

                    case 'refresh': {
                        let embed = await getDisplayEmbed(currentPage);
                        await interaction.editReply({embeds: [embed]});

                        if (i) await (await i.reply({content: `temp`, flags: MessageFlags.Ephemeral})).delete();
                        break;
                    }

                    case 'forward': {
                        currentPage = Math.min(currentPage + 1, totalPages);
                        let embed = await getDisplayEmbed(currentPage);
                        await interaction.editReply({embeds: [embed]});

                        if (i) await (await i.reply({content: `temp`, flags: MessageFlags.Ephemeral})).delete();
                        break;
                    }

                    case 'last': {
                        currentPage = totalPages;
                        let embed = await getDisplayEmbed(currentPage);
                        await interaction.editReply({embeds: [embed]});

                        if (i) await (await i.reply({content: `temp`, flags: MessageFlags.Ephemeral})).delete();
                        break;
                    }
                }
            })
        } catch (e) {
            let embed = new EmbedBuilder()
            .setTitle(`❌ Error`)
            .setDescription(`An error occured while trying to fetch leaderboard info: ${e.message}`)
            .setColor(Colors.Red)
            .setTimestamp()

            await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
        }
    },
}