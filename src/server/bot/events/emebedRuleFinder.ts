export default async (interaction: { respond?: any; commandName?: any; options?: any; }) => {
    const { commandName, options } = interaction;
    let Catagory = options.getString('category')
    let RuleNumber = options.getString('rulenumber')
    if (Catagory === 'rulesoverview') {
        interaction.respond([{ name: 'You can not select a rule from Rules Overview. Select a specific catogory to use this option.', value: 'NotFound' }]);
        return;
    }
    const { fs } = require('./../importdefaults.js');
    var keysUpper: (string | number)[] = [];
    var keysLower: string[] = [];
    let embedchoices: { name: any; value: any; }[] = [];
    const rules = JSON.parse(fs.readFileSync('./config/rules.config.json'));
    if (!Catagory || Catagory === 'null') {
        interaction.respond([{ name: 'A Catogory Is Required to use this option.', value: 'NotFound' }]);
        return;
    }


    function collectNames(obj: { [x: string]: any; }, collection: { [x: string]: any; } = {}) {
        for (let key in obj) {
            if (Array.isArray(obj[key])) {
                collection[key] = obj[key].map((item: { name: any; }) => item.name);
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                collectNames(obj[key], collection);
            }
        }
        return collection;
    }
    const names = collectNames(rules)

    Object.keys(rules).forEach(key => {
        if (!key.includes("_") && !key.includes("Overveiw")) {
            keysUpper.push(key);
            keysLower.push(key.toLowerCase().replace(/ /g, ''));
        }
    });

    let finalname: string;
    names[keysUpper[keysLower.indexOf(Catagory)]].forEach((element: string) => {
        if (element.includes('**')) return;
        const value = rules[keysUpper[keysLower.indexOf(Catagory)]].find((o: { name: any; }) => o.name === element).value
        if (`${element}: ${value}`.length > 100) {
            finalname = `${element}: ${value}`.slice(0, 94) + '...';
        } else {
            finalname = `${element}: ${value}`;
        }

        embedchoices.push({
            name: finalname,
            value: element.toLowerCase().replace(/ /g, '')
        });
    });

    interaction.respond(embedchoices);
}