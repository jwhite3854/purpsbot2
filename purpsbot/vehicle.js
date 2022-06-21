const VehicleObject = require('./VehicleObject');
const PURPSbotVehicleLoader = require('./vehicle-loader');

const PURPSbotVehicle = class {
    constructor(data = {}) {
        this.vehicleName = false;
        this.command = false;
        this.args = [];
        this.reply = 'you ok??';
        this.commands = [
            'health',
            'systems',
            'damage',
            'repair',
        ];
        this.vehicles = {};
        PURPSbotVehicleLoader.setupVehicles(['atreides']).then((vehicles) => {this.vehicles = vehicles;});
    }

    isListening = async (args) => {
        this.vehicle = false;
        this.command = false;
        
        if (args.length > 0) {
            let vehicleName = args.shift();
            if (this.vehicles.hasOwnProperty(vehicleName)) {
                this.vehicleName = vehicleName;
                if (args.length > 0) {
                    this.command = args.shift();
                    this.args = args;
                } else {
                    this.command = '0';
                }
            } else {
                this.reply = 'Could not find the vehicle named "'+vehicleName+'"';
            }
        } else {
            this.reply = 'Did you include the vehicle name?';
        }

        return (this.command !== false);
    }

    runCommand = () => {
        let vehicle = this.vehicles[this.vehicleName];
        if (this.commands.includes(this.command)) {
            this.reply = PURPSbotVehicle[this.command](vehicle, this.args);
        } else {
            this.reply = 'Name: '+vehicle.name + ' | Type: '+vehicle.type + ' | Description: '+vehicle.description;
        }
    }

    static health = (vehicle, args) => {
        let output   = vehicle.name + ' Health: '+"\n";
        output      += ' ~ ' + PURPSbotVehicle.#sectionHealth(vehicle, 'bow') + "\n";
        output      += ' ~ ' + PURPSbotVehicle.#sectionHealth(vehicle, 'port') + "\n";
        output      += ' ~ ' + PURPSbotVehicle.#sectionHealth(vehicle, 'starboard') + "\n";
        output      += ' ~ ' + PURPSbotVehicle.#sectionHealth(vehicle, 'aft');

        return output;
    }

    static #sectionHealth = (vehicle, section) => {
        let fl = section.substr(0,1).toUpperCase();
        let sectionTitle = fl + section.substr(1);

        return sectionTitle+': Armor ' + vehicle.armor[section].current +' | Internal ' + vehicle.hull[section].current;
    }

    static systems = (vehicle, args) => {
        let id = args.shift();
        if ( typeof id !== 'undefined' ) {
            const systemId = parseInt(String(id));
            return PURPSbotVehicle.updateSystemStatus(vehicle, systemId, args);
        } else {
            return PURPSbotVehicle.getSystemsStatuses(vehicle);
        }
    }

    static updateSystemStatus(vehicle, systemId, args) {
        const status = args.shift();
        const systemKey = Object.keys(vehicle.systems)[(systemId - 1)];
        let output = '';

        if ( status === 'off' ) {
            vehicle.systems[systemKey].status = 0;
            output += "\n" + systemId + '. ' + systemKey + ', Status: ' + status;
        } else if ( status === 'on' ) {
            vehicle.systems[systemKey].status = 1;
            output += "\n" + systemId + '. ' + systemKey + ', Status: ' + status;
        } else if ( status === 'power' ) {
            var power = parseInt(args.shift());

            if ( typeof vehicle.systems[systemKey].range !== 'undefined' &&
                    vehicle.systems[systemKey].range.includes(power) ) {
                    vehicle.systems[systemKey].status = parseInt(power);
                    output += "\n" + systemId + '. ' + systemKey + ', Status: ' + status + ' ' + power;
            } else {
                output += "\n" + systemId + '. ' + systemKey + ' cannot accommodate that level of power.';
            }
        } else {
            output += "[" + systemId + '. ' + systemKey + '] Status: ' + (vehicle.systems[systemKey].status > 0 ? 'On' : 'Off') + ', ';
            output += 'Power: ' + vehicle.systems[systemKey].power + ', Heat: ' + vehicle.systems[systemKey].heat;
        }
       
        PURPSbotVehicleLoader.saveVehicle(vehicle);

        return output;
    }

    static getSystemsStatuses(vehicle) {
        let power = 0;
        let heat = 0;
        let speed = 0;
        let output = ''
        let systemId = 1;
        for (const [systemName, stats] of Object.entries(vehicle.systems)) {
            if ( stats.status > 0 ) {
                power += stats.power * stats.status;
                heat += stats.heat * stats.status;

                if ( typeof stats.speed !== 'undefined' ) {
                    speed = stats.speed[stats.status];
                }
                
                output += "\n" + '**' + systemId + '. ' + systemName + '**';
            } else {
                output += "\n" + systemId + '. ' + systemName;
            }
            systemId++;
        }

        return 'Total Free Power: '+power+' | Total Heat: ' + heat + ' | Maximum Speed: ' + speed + ' kmPH ' + "\n" + output;
    }

    static damage = (vehicle, args) => {
        const section = args.shift();
        if (!vehicle.hull.hasOwnProperty(section)) {
            return 'Vehicle does not have that section';
        }

        const dmg = parseInt(args.shift());
        const currentArmor = vehicle.armor[section].current;
        const currentHull = vehicle.hull[section].current;

        if ( currentArmor >= dmg) {
            vehicle.armor[section].current = currentArmor - dmg;
        } else {
            let hullDmg = dmg - currentArmor;
            vehicle.armor[section].current = 0;
            if (currentHull >= hullDmg) {
                vehicle.hull[section].current = currentHull - hullDmg;
            } else {
                vehicle.hull[section].current = 0;
            }
        }

        PURPSbotVehicleLoader.saveVehicle(vehicle);
      
        return 'Health: '+PURPSbotVehicle.#sectionHealth(vehicle, section);
    }

    static repair = (vehicle, args) => {
        const section = args.shift();
        if (!vehicle.hull.hasOwnProperty(section)) {
            return 'Vehicle does not have that section';
        }

        const dmg = parseInt(args.shift());
        let repairAmt = vehicle.armor[section].base;
        if ( dmg !== 'full' ) {
            var current = vehicle.armor[section].current;
            repairAmt = current + parseInt(dmg);
        } 

        vehicle.armor[section].current = repairAmt;
        PURPSbotVehicleLoader.saveVehicle(vehicle);

        return 'Health: '+PURPSbotVehicle.#sectionHealth(vehicle, section);
    }
}

module.exports = new PURPSbotVehicle();