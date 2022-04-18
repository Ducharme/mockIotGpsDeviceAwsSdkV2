
interface GpsLocation {
	latitude: number;
	longitude: number;
	altitude: number;
}

const MaxLatitude: number = 90;
const MinLatitude: number = -90;
const MaxLongitude: number = 180;
const MinLongitude: number = -180;
const WrapLongitude: number = MaxLongitude * 2;
const WrapLatitude: number = MaxLatitude * 2;


// Math.random() function returns a floating-point, pseudo-random number 
// in the range 0 to less than 1 (inclusive of 0, but not 1) with 
// approximately uniform distribution over that range
const RandomNumbers: number[] = [Math.random()-0.5,
    Math.random()-0.5, Math.random()-0.5, Math.random()-0.5,
    Math.random()-0.5, Math.random()-0.5, Math.random()-0.5,
    Math.random()-0.5, Math.random()-0.5, Math.random()-0.5];

interface DeviceProperties {
    deviceId: string;
	firmwareVersion: string;

    pingIntervalInMs: number;
    pingTargetCount: number;
    publishToTopic: string;
}

class Device {
    protected location: GpsLocation;
    protected properties: DeviceProperties;
	protected batteryLevel: number;
    private randomIndex: number = 0;

    constructor(loc: GpsLocation, props: DeviceProperties) {
        this.location = loc;
        this.properties = props;
        this.batteryLevel = 100;
    }

    Move(latitudeDelta: number, longitudeDelta: number, altitudeDelta: number) {
        var newLatitude = this.location.latitude + latitudeDelta;
        if (newLatitude > MaxLatitude) {
            newLatitude -= WrapLatitude;
        } else if (newLatitude < MinLatitude) {
            newLatitude += WrapLatitude;
        }
        
        var newLongitude = this.location.longitude + longitudeDelta;
        if (newLongitude > MaxLongitude) {
            newLongitude -= WrapLongitude;
        } else if (newLongitude < MinLongitude) {
            newLongitude += WrapLongitude;
        }

        var newAltitude = this.location.altitude + altitudeDelta;
        if (newAltitude < 0) {
            newAltitude = 0.0;
        }
        
        this.location.latitude = newLatitude;
        this.location.longitude = newLongitude;
        this.location.altitude = newAltitude;
    }

    MoveRandomly() {
        var randomNumber = RandomNumbers[this.randomIndex++];
        if (this.randomIndex === RandomNumbers.length) {
            this.randomIndex = 0;
        }
        
        this.Move(randomNumber, randomNumber, randomNumber);
    }

    public getLocation() {
        return this.location;
    }

    public getProperties() {
        return this.properties;
    }

    public getBatteryLevel() {
        return this.batteryLevel;
    }
}

export { GpsLocation, DeviceProperties, Device }
