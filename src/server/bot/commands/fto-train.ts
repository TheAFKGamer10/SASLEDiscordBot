const { client, EmbedBuilder, env } = require('../importdefaults.js');

export default async (interaction: { member?: any; reply?: any; commandName?: any; options?: any; }) => {
    //await interaction.deferReply(); // Does not work because it will not send the ping to the user.
    const { commandName, options } = interaction;

    const guild = client.guilds.cache.get(env.parsed.GUILD_ID);
    const cadet = options.getUser('cadet');
    const fto = interaction.member;
    const cadet_id = cadet.id;
    const fto_id = fto.id;
    if (cadet_id == fto_id) {
        interaction.reply({ content: 'You can not train yourself.', ephemeral: true});
        return;
    }
    const cadet_fullname = guild.members.cache.get(cadet_id).displayName;
    const fto_fullname = fto.displayName;
    const cadet_callsign = cadet_fullname.split(' | ')[0];
    const fto_callsign = fto_fullname.split(' | ')[0];
    var CADETroleMembers = guild.roles.cache.get(env.parsed.CADET_ROLE_ID).members;
    if (!cadet_fullname.includes(' | ') || cadet_callsign.charAt(cadet_callsign.length - 3) !== '0' || !Array.from(CADETroleMembers.keys()).includes(cadet_id)) {
        interaction.reply({ content: 'You can not train for somebody who is not a cadet.', ephemeral: true});
        return;
    };

    const member = guild.members.fetch(cadet);
    (await member).roles.add(env.parsed.JOIN_SERVER_ROLE_ID);
    (await member).roles.add(env.parsed.JOIN_SERVER_ROLE_ID);

    interaction.reply({ content: `<@${cadet_id}>,\n<@${fto_id}> is ready to train you now. Plase join the server to get your training.` });

};