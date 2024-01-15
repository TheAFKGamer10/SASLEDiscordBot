module.exports = async (interaction) => {
    const { commandName, options } = interaction;
    Catagory = options.getString('category')
    RuleNumber = options.getString('rulenumber')
    if (Catagory === 'rulesoverview') {
        interaction.respond([{ name: 'You can not select a rule from Rules Overview. Select a specific catogory to use this option.', value: 'NotFound' }]);
        return;
    }
    const fs = require('fs');
    var keysUpper = [];
    var keysLower = [];
    let embedchoices = [];
    const rules = JSON.parse(fs.readFileSync('./rules.config.json'));
    if (!Catagory || Catagory === 'null') {
        interaction.respond([{ name: 'A Catogory Is Required to use this option.', value: 'NotFound' }]);
        return;
    }


    function collectNames(obj, collection = {}) {
        for (let key in obj) {
            if (Array.isArray(obj[key])) {
                collection[key] = obj[key].map(item => item.name);
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

    names[keysUpper[keysLower.indexOf(Catagory)]].forEach(element => {
        if (element.includes('**')) return;
        value = element.toLowerCase().replace(/ /g, '');

        embedchoices.push({
            name: element,
            value: value
        });
    });

    interaction.respond(embedchoices);
}