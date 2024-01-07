const { client, EmbedBuilder, env} = require("../importdefaults");

module.exports = async (interaction) => {
    const { commandName, options } = interaction;

    if (options.getString('option') === 'rules') {
        // Start of embed
        const embed = new EmbedBuilder()
            .setTitle('Rules')
            .addFields(
                { name: '**Discord Chat Rules**', value: 'These rules apply to the Discord server.' },
                { name: 'Rule #1', value: 'Please do not advertise. (Do not give links to other servers.)', inline: true },
                { name: 'Rule #2', value: 'English only.', inline: true },
                { name: 'Rule #3', value: 'Do not ping Admin or Staff. (If you have a problem, cerate a ticket.)', inline: true },
                { name: 'Rule #4', value: 'Do not spam. (We do not want the same thing over and over again.)', inline: true },
                { name: 'Rule #5', value: 'Do not ping @everyone.', inline: true },
                { name: 'Rule #6', value: 'You must be over 13. (Discords terms of services rule. "By using or accessing the Discord application (the “App”) or the website located at https://discord.com/ (the "Site"), which are collectively referred to as the “Service,” you agree (i) that you are 13 years of age and the minimum age of digital consent in your country." You can find all of the rules of discord at https://discord.com/terms.)' },
            )
            .addFields({ name: '\u200B', value: '\u200B' }) // Break bewtween server and discord rules.
            .addFields(
                { name: '**FiveM Server Rules**', value: 'These rules apply to the FiveM server.' },
                { name: 'Rule #1', value: 'You must be trained before you patrol by yourself. Create a ticket and we will be hapy to train you.', inline: true },
                { name: 'Rule #2', value: 'Using our cad system is required during gameplay. (Unless down.)', inline: true },
                { name: 'Rule #3', value: 'Do not abuse your power. (Do not use your power to gain an advantage over other players.)', inline: true },
                { name: 'Rule #4', value: 'Do not break roleplay. (Do not do anything that would not happen in real life. Unless an exception is mady by actiave staff.)', inline: true },
                { name: 'Rule #5', value: 'Cars and Clothing are for a specific department. (Please use items specific to your rank.)', inline: true },
                { name: 'Rule #6', value: 'Do not use any mods. (This includes trainers, cheats, and any other mods.)', inline: true },
                { name: 'Rule #7', value: 'Use common sense. (Don\'t be stupid.)', inline: true },
            )
            .setColor(0xFF470F)
            .setFooter({ text: 'If you violate the rules you agree to the consequences.'})
            .setTimestamp();
        // End of embed
        
        if (options.getChannel('chanel') === null) {
            interaction.reply({ embeds: [embed] });
        } else {
            client.channels.cache.get(options.getChannel('chanel').id).send({ embeds: [embed] });
            interaction.reply({ content: 'Embed sent!', ephemeral: true });
        }
    }
}