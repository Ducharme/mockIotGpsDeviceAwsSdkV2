
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

enum DeviceState { STOPPED='STOPPED', PASSIVE='PASSIVE', ACTIVE='ACTIVE', WAITING='WAITING' };


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
    protected state: DeviceState = DeviceState.STOPPED;
    private streamId : number = -1;
    private randomIndex: number = 0;

    constructor(loc: GpsLocation, props: DeviceProperties) {
        this.location = loc;
        this.properties = props;
        this.batteryLevel = 100;
    }

    setStreamId(streamId: number) {
        this.streamId = streamId;
    }

    changeStateToActive() {
        this.state = DeviceState.ACTIVE;
    }

    changeStateToPassive() {
        this.state = DeviceState.PASSIVE;
    }

    changeStateToWaiting() {
        this.state = DeviceState.WAITING;
    }

    changeStateToStopped() {
        this.state = DeviceState.STOPPED;
    }

    getState() {
        return this.state;
    }

    getPayload(index: number) {
        
        var loc = this.getLocation();
        const now = Date.now();
        const msg = {
            deviceId: this.getProperties().deviceId,
            streamId: this.streamId,
            state: this.getState(),
            ts: now,
            fv: this.getProperties().firmwareVersion,
            batt: this.getBatteryLevel(),
            gps: {
                lat: loc.latitude,
                lng: loc.longitude,
                alt: loc.altitude
            },
            seq: index + 1
        };
        return msg;
    }

    move(latitudeDelta: number, longitudeDelta: number, altitudeDelta: number) {
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

    moveRandomly() {
        var randomNumber = RandomNumbers[this.randomIndex++];
        if (this.randomIndex === RandomNumbers.length) {
            this.randomIndex = 0;
        }
        
        this.move(randomNumber, randomNumber, randomNumber);
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
