"use strict";

const { ChatInputCommandInteraction, Colors, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { getVolume, setVolume } = require(`${PROJECT_ROOT}/utils/musicHandler.js`);

module.exports = {
    data: new SlashCommandBuilder()
    .setName(`volume`)
    .setDescription(`Gets the current volume, or sets a new volume if provided.`)
    .addIntegerOption(opt => 
        opt.setName(`new`)
        .setDescription(`The volume to set.`)
        .setRequired(false)
    ),

    /**
     * @param {Object} param0
     * @param {ChatInputCommandInteraction} param0.interaction 
     */
    run: async ({interaction}) => {
        await interaction.deferReply();

        try {
            const volumeSetting = interaction.options.getInteger(`new`);

            if (!volumeSetting) {
                const actualVol = getVolume();

                let embed = new EmbedBuilder()
                .setTitle(`🔊 Current Volume`)
                .setDescription(`The bot is currently playing at \`${actualVol}%\` volume.`)
                .setColor(Colors.DarkBlue)
                .setTimestamp();

                await interaction.editReply({embeds: [embed]});
            } else {
                setVolume(interaction, volumeSetting);

                let embed = new EmbedBuilder()
                .setTitle(`✅ Volume Changed`)
                .setDescription(`The bot is now playing at \`${volumeSetting}%\` volume.`)
                .setColor(Colors.Green)
                .setTimestamp();

                await interaction.editReply({embeds: [embed]});
            }
        } catch (e) {
            let embed = new EmbedBuilder()
            .setTitle(`❌ Error`)
            .setDescription(e.message)
            .setColor(Colors.Red)
            .setTimestamp();

            await interaction.editReply({embeds: [embed]});
            return;
        }
    }
}