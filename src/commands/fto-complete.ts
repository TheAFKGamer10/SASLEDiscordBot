import { client, EmbedBuilder, env } from '../importdefaults.js';

export default async (interaction: { deferReply?: any; member?: any; editReply?: any; commandName?: any; options?: any; }) => {
    await interaction.deferReply();
    const { commandName, options } = interaction;
    const TrainingCars = require('../../config/fto-complete/TrainingCars.config.json');
    const blurbs = require('../../config/fto-complete/DepartmentBlurbs.config.json');
    const logos = require('../../config/fto-complete/DepartmentLogos.config.json');
    const mysql = require('./../events/mysqlhander.js'); // Format: (passed [1 or 0], cadet_username [their username with callsign], cadet_id [their discord id], fto_username [their username with callsign], fto_id [their discord id])
    const guild = client.guilds.cache.get(env.parsed.GUILD_ID);
    const passed = options.getBoolean('passed');
    let status;
    if (passed) {
        status = 'ACCEPTED';
    } else {
        status = 'DENIED';
    }
    const cadet = options.getUser('cadet');
    const fto = interaction.member;
    const cadet_id = cadet.id;
    const fto_id = fto.id;
    if (cadet_id == fto_id) {
        interaction.editReply({ content: 'You can not complete your own training.' });
        return;
    }
    const cadet_fullname = guild.members.cache.get(cadet_id).displayName;
    const fto_fullname = fto.displayName;
    const cadet_callsign = cadet_fullname.split(' | ')[0];
    const fto_callsign = fto_fullname.split(' | ')[0];
    var CADETroleMembers = guild.roles.cache.get(env.parsed.CADET_ROLE_ID).members;
    if (!cadet_fullname.includes(' | ') || cadet_callsign.charAt(cadet_callsign.length - 3) !== '0' || !Array.from(CADETroleMembers.keys()).includes(cadet_id)) {
        interaction.editReply({ content: 'You can not complete training for somebody who is not a cadet.' });
        return;
    };
    var departmentList = JSON.parse(env.parsed.LIST_OF_DEPARTMENTS.split(", "));
    let cadetdepartment;
    let cadetdepartmentshort;
    let cadetdepartmentid;
    let ftodepartment;
    departmentList.forEach((CurrentDepartment: string) => {
        if (fto_callsign.includes('D')) {
            ftodepartment = 'Federal';
        }
        if (cadet_callsign.includes(`${env.parsed[CurrentDepartment.toUpperCase() + '_START_LETTER']}`)) {
            cadetdepartment = env.parsed[CurrentDepartment.toUpperCase() + '_DEPARTMENT_NAME'];
            cadetdepartmentshort = CurrentDepartment.toUpperCase();
            cadetdepartmentid = env.parsed[CurrentDepartment.toUpperCase() + '_ROLE_ID'];
        }
        if (fto_callsign.includes(`${env.parsed[CurrentDepartment.toUpperCase() + '_START_LETTER']}`)) {
            ftodepartment = env.parsed[CurrentDepartment.toUpperCase() + '_DEPARTMENT_NAME'];
        }
    });

    let formatedcars: string = '';
    TrainingCars[cadetdepartmentshort as unknown as string].forEach((CurrentCar: any) => {
        formatedcars += `${CurrentCar}\n`;
    });

    const now = new Date();
    function pad(n: string | number) {
        return Number(n) < 10 ? '0' + n : n
    }
    const localDateTime = now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate()) + " " + pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds());

    let blurb = '';
    if (cadetdepartmentshort) {
        blurb = blurbs[cadetdepartmentshort].replace(/\n/g, "\n> ");
    }

    const report_id = (await mysql('select', 'cadettrainings', `SELECT id FROM cadettrainings`)).length + 1;

    const member = guild.members.fetch(cadet);
    if (passed) {
        mysql('insert', 'cadettrainings', `(1, '${cadet_fullname}', ${cadet_id}, '${fto_fullname}', ${fto_id}, '${new Date(new Date().getTime()).toISOString().replace(/T/, ' ').replace(/\..+/, '')}')`);
    } else {
        mysql('insert', 'cadettrainings', `(0, '${cadet_fullname}', ${cadet_id}, '${fto_fullname}', ${fto_id}, '${new Date(new Date().getTime()).toISOString().replace(/T/, ' ').replace(/\..+/, '')}')`);
    }

    let departmentlogo = '';
    if (cadetdepartmentshort) {
        departmentlogo = logos[cadetdepartmentshort];
    };
    const passedlogo = logos[status];

    interaction.editReply({
        content: `
<:${departmentlogo}> ▬▬ **Field Training Office Report #${report_id}** ▬▬ <:${departmentlogo}>

**STATUS: ${status}** <:${passedlogo}>

You Have Been **${status}** Into <:${departmentlogo}> **${env.parsed[cadetdepartmentshort + '_DEPARTMENT_NAME']}**!

> ${blurb}

${status === 'ACCEPTED' ? `<:${departmentlogo}> ▬▬ **Vehicle Spawning** ▬▬ <:${departmentlogo}>\n\nYou Have Been Given Access To The Following Vehicles:\n**${formatedcars}**` : ''}
<:${departmentlogo}> ▬▬ **Forum** ▬▬ <:${departmentlogo}>

**Cadet Forum**
\`\`\`
Name: ${cadet_fullname.split(' | ')[1]}
Date Of FTO: ${localDateTime.split(' ')[0]}
Time Of FTO: ${localDateTime.split(' ')[1]}
Rank: ${cadetdepartment!.split(' (')[0]} Cadet
Callsign: ${cadet_callsign!}
\`\`\`
**FTO Forum**
\`\`\`
Name: ${fto_fullname!.split(' | ')[1]}
Date Of FTO: ${localDateTime!.split(' ')[0]}
Time Of FTO: ${localDateTime!.split(' ')[1]}
Rank: ${ftodepartment!.split(' (')[0]} FTO
Callsign: ${fto_callsign}
\`\`\`

<:${departmentlogo}> ▬▬ **Support** ▬▬ <:${departmentlogo}>

If You Have Any Issues Spawning Vehicles, or With Other Members, Please Contact Support!

<:${departmentlogo}> ▬▬ **Signing** ▬▬ <:${departmentlogo}>

${status === 'ACCEPTED' ? `Welcome To The Team` : ''}
            *Signed*
> ${fto_fullname.split(' | ')[1]}
> Field Training Officer

***Preserve The Peace, Enforce The Disturb***
`});

    const logembed = new EmbedBuilder()
        .setTitle(`Cadet ${status === 'ACCEPTED' ? 'Passed' : 'Failed'} Training`)
        .setDescription(`<@${fto_id}> has ${status} <@${cadet_id}> into <@&${cadetdepartmentid}>.`)
        .setColor(0x0099FF)
        .setTimestamp();
    // End of embed
    client.channels.cache.get(env.parsed.LOG_CHANNEL_ID).send({ embeds: [logembed] });

    const index = cadet_callsign.length - 1;
    let num1 = cadet_callsign.charAt(index - 1);
    let num2 = cadet_callsign.charAt(index);

    if (passed) {
        (await member).roles.remove(env.parsed.CADET_ROLE_ID);
        (await member).roles.remove(env.parsed.CADET_ROLE_ID);
        (await member).roles.add(env.parsed[cadetdepartmentshort + '_PROBIB_ID']);
        (await member).roles.add(env.parsed[cadetdepartmentshort + '_PROBIB_ID']);

        (await member).setNickname(`${env.parsed[cadetdepartmentshort + '_START_LETTER']}-1${num1 + num2} | ${cadet_fullname.split(' | ')[1]}`);
    } else {
        (await member).roles.remove(env.parsed.JOIN_SERVER_ROLE_ID);
    }

    console.log(`${num1 + num2} has ${status === 'ACCEPTED' ? 'Passed' : 'Failed'} training`);
}

