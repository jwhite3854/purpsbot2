const PURPSbotVehicle = require('./vehicle');

const PURPSbot = class {
    constructor(data = {}) {
        this.command = false;
        this.args = [];
        this.reply = '';
        this.commands = [
            'roll',
            'rollsave',
            'rollhelp',
            'respond',
            'vehicle',
            'vehiclehelp'
        ];
        console.log('i exist!');
    }

    isListening = (msg) => {
        this.command = false;
        this.args = [];
        if (msg.content.substring(0, 2) == '--') {
            let input_string = msg.content.toLowerCase().trim();
            let args = input_string.substring(2).split(' ');
            if (args.length > 0) {
                let cmd = args.shift();
                if (this.commands.includes(cmd)) {
                    this.command = cmd;
                    this.args = args;
                }
            }
        } else if (msg.content.toLowerCase().includes("purpsbot")) {
            this.command = 'respond';
            this.args = [msg.author.username, msg.content];
        }

        return (this.command);
    }

    runCommand = () => {
        if (this.commands.includes(this.command)) {
            this.reply = PURPSbot[this.command](this.args);
        }
    }

    static roll = (args) => {
        let targetNumber = 0;
        let botchTolerance = 0;
        let successes = 0;
        let botches = 0;
        let dice = [];
        let results = [];
        const diceRegex = /^\d+d\d+$/;

        for (let arg of args) {
            if (diceRegex.test(arg)) {
                dice = arg.split('d');
                continue;
            }

            let prefix = arg.substring(0,1);
            if (prefix === 'v') {
                targetNumber = parseInt(arg.substring(1));
            } else if (prefix === 'b') {
                botchTolerance = parseInt(arg.substring(1));
            }
        }

        if (dice.length !== 2) {
            return 'Rolling error: Your roll syntax is not XdY.'
        }

        for (let ii = 0; ii < dice[0]; ii++ ) {
            let roll = Math.floor(Math.random() * dice[1]) + 1;
            results.push(roll);

            if ( roll == 1 ) {
                botches++;
            }

            if ( roll >= targetNumber ) {
                successes++;
            }
        }

        while ( botches > 0 ) {
            if ( botchTolerance < 1 ) {
                successes--;
            }
            botchTolerance--;
            botches--;
        }

        let output = 'Rolled: [' + results.join(', ') + ']';

        if ( targetNumber > 0 ) {
            if ( successes > 0 ) {
                output = '**' + successes + ' Success'+ ( successes > 1 ? 'es' : '' ) +'** - ' + output;
            } else if ( successes < 0 ) {
                output = '**Critical Failure** - ' + output;
            } else {
                output = '**Failure** - ' + output;
            }
        }

        return output;
    }

    static rollsave = (args) => {
        let roll = Math.floor(Math.random() * 10) + 1;
        let result = roll;
        let targetNumber = 0;

        for (let arg of args) {
            let prefix = arg.substring(0,1);
            if (prefix === '+' ) {
                result = roll + parseInt(arg.substring(1));
            } else if (prefix === '-') {
                result = roll - parseInt(arg.substring(1));
            }

            if (prefix === 'v') {
                targetNumber = parseInt(arg.substring(1));
            }
        }

        let output = '**Result: ' + result + '** - ';

        if ( targetNumber > 0 ) {
            if ( result >= targetNumber ) {
                output = '**Success** - ' + output;
            } else {
                output = '**Failure** - ' + output;
            }
        }

        return output + 'Rolled: ' + roll;
    }

    static rollhelp = (args) => {
        let output = '~ **--roll XdY vZ bN** Standard skill roll, where X is number of dice, Y is d-type. Optional: Z (target number),  N (botch tolerance)';
        return output +  "\n" + '~ **/rollsave X** Saving roll, where X is an optional Save mod.';
    }

    static respond = (args) => {
        return args[1].toLowerCase().replace("purpsbot", '**'+args[0]+'**');
    }

    static vehiclehelp = (args) => {
        let output = '**--vehicle [name]** Standard information on the vehicle.';
        output +=  "\n" + '**/vehicle [name] systems** View installed systems in vehicle. **Bold systems** are **ON**.';
        output +=  "\n" + '**/vehicle [name] systems N** View systems details, using ID number found in Systems list.';
        output +=  "\n" + '**/vehicle [name] systems N off/on** Turn the sytem off or on using the System ID number.';
        output +=  "\n" + '**/vehicle [name] systems N power X** Set system to power factor X using the System ID number.';
        output +=  "\n" + '**/vehicle [name] health** View current armor and internal hull health.';
        output +=  "\n" + '**/vehicle [name] damage [side] X** Deal X damage to the an area of the armor or hull.';
        output +=  "\n" + '**/vehicle [name] repair [side] X** Repair X damage to the an area of the armor or hull.';

        return output;
    }

    static vehicle = (args) => {
        if (PURPSbotVehicle.isListening(args)) {
            PURPSbotVehicle.runCommand();
        }

        return PURPSbotVehicle.reply;
    }
}

module.exports = new PURPSbot();