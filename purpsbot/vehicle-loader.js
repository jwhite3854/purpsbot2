const fs = require('fs');
const yaml = require('yaml');
const VehicleObject = require('./VehicleObject');

const PURPSbotVehicleLoader = class {

    constructor() {}

    setupVehicles = async (vehicleNames = []) => {
        let vehicles = {};
        for (let name of vehicleNames) {
            let fileName = '/home/julia/Sandbox/nPURPSbot2/vehicles/'+name.toLowerCase()+'.yaml';
            try {
                const data = await fs.promises.readFile(fileName, 'utf8');
                const loadedData = yaml.parse(data);
                if (typeof loadedData === 'object' && loadedData.hasOwnProperty('name')) {
                    vehicles[name] = new VehicleObject(loadedData);
                }
            } catch (err) {
                console.error(err);
            }
        }

        return vehicles;
    }

    saveVehicle = (vehicle) => {
        const fileName = '/home/julia/Sandbox/nPURPSbot2/vehicles/'+vehicle.name.toLowerCase()+'.yaml';
        const yamlStr = yaml.stringify(vehicle.data);
        
        fs.writeFileSync(fileName, yamlStr, 'utf8');
    }
}

module.exports = new PURPSbotVehicleLoader();