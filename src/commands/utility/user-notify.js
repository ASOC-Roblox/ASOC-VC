"use strict";

const { Colors, ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const isModerator = require(`${PROJECT_ROOT}/src/validations/isModerator.js`);

module.exports = {
    data: new SlashCommandBuilder()
    .setName(`notify`)
    .setDescription(`Sends a preset DM Notification to a specific user.`)
    .addUserOption(opt =>
        opt.setName(`target`)
        .setDescription(`The person to notify.`)
        .setRequired(true)
    )
    .addStringOption(opt =>
        opt.setName(`preset`)
        .setDescription(`The notification preset to send.`)
        .setRequired(true)
        .setChoices([
            {name: 'Not in NBTF Server', value: 'MISSING_NBTF'}
        ])
    ),

    /**
    * @param {Object} param0
    * @param {ChatInputCommandInteraction} param0.interaction 
    */
    run: async ({interaction}) => {
        await interaction.deferReply();

        try {
            if (!isModerator(interaction)) return;

            const user = interaction.options.getUser('target', true);
            const presetInput = interaction.options.getString('preset', true);

            const presetTable = {
                "MISSING_NBTF": new EmbedBuilder()
                .setTitle(`⚠️ Not in NBTF Server`)
                .setDescription(`It has been noticed that you are not in the NBTF Server after joining ASOC. As per NBTF Faction Rules (which ASOC is subject to as it is officially placed on its faction board), all members of an NBTF faction are **required** to be in the NBTF Server. As such, it is mandatory that you join the NBTF Server accordingly: https://discord.gg/nbtf. If you fail to join the NBTF Server, you will be kicked. For further questions, please contact a Moderator.`)
                .setColor(Colors.Yellow)
                .setTimestamp(),
            } 

            const userDM = await user.createDM(true);
            await userDM.send({embeds: [presetTable[presetInput]]});

            let returnEmbed = new EmbedBuilder()
            .setTitle(`✅ Notice Sent`)
            .setDescription(`The user you specified was successfully sent the appropriate notice.`)
            .setColor(Colors.Green)
            .setTimestamp();

            await interaction.editReply({embeds: [returnEmbed]});
        } catch (e) {
            let returnEmbed = new EmbedBuilder()
            .setTitle(`❌ Failed to Send Notice`)
            .setDescription(`ASOC Virtual Clerk could not DM the user you specified. This is likely due to their privacy settings in this server preventing them from receiving DMs.`)
            .setColor(Colors.Red)
            .setTimestamp();

            await interaction.editReply({embeds: [returnEmbed]});
            return;
        }
    }
}