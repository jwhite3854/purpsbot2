
module.exports = VehicleObject = class {
    constructor(data = {}) {
        this.data = data;
    }

    get name() {
        return this.data.name;
    }

    get type() {
        return this.data.type;
    }

    get description() {
        return this.data.description;
    }

    get armor () {
        return this.data.armor;
    }

    get hull() {
        return this.data.hull;
    }

    get systems() {
        return this.data.systems;
    }
}