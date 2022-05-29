import { mqtt } from 'aws-iot-device-sdk-v2';
import { TextDecoder } from 'util';
import { Device } from './device';


class Session {
    private conn: mqtt.MqttClientConnection;
    private dev: Device;

    constructor(connection: mqtt.MqttClientConnection, device: Device) {
        this.conn = connection;
        this.dev = device;
    }
    
    public async execute(listenToTopic: boolean) {
        return new Promise(async (resolve, reject) => {
            try {
                if (listenToTopic) {
                    await this.listenAppTopics(resolve);
                }
                
                var topic = this.dev.getProperties().publishToTopic;
                await this.publishOnTopic(topic, listenToTopic, resolve);
            }
            catch (error) {
                reject(error);
            }
        });
    }

    private async publishOnTopic(topic: string, listenToTopic: boolean, resolve: any) {
        var count : number = this.dev.getProperties().pingTargetCount;
        var infinite: boolean = count === 0;
        var interval = this.dev.getProperties().pingIntervalInMs;

        if (infinite) {
            var opIndex : number = 0;
            const sleep = (ms : number) => new Promise(r => setTimeout(r, ms));
            while (true) {
                await this.publishNow(opIndex, topic, listenToTopic);
                await sleep(interval);
                opIndex = opIndex + 1;
            }
        } else {
            for (let opIndex = 0; opIndex < count; ++opIndex) {
                const publish = async () => {
                    await this.publishNow(opIndex, topic, listenToTopic);
                };
                setTimeout(publish, opIndex * interval);
            }
        }

        if (!listenToTopic) {
            var timeout = (count + 1) * interval;
            setTimeout(() => resolve("Finished publishing events"), timeout);
        }
    }

    private async publishNow(index: number, topic: string, listenToTopic: boolean) {
        this.dev.MoveRandomly();
        var loc = this.dev.getLocation();
        const now = Date.now();
        const msg = {
            deviceId: this.dev.getProperties().deviceId,
            ts: now,
            fv: this.dev.getProperties().firmwareVersion,
            batt: this.dev.getBatteryLevel(),
            gps: {
                lat: loc.latitude,
                lng: loc.longitude,
                alt: loc.altitude
            },
            seq: index + 1
        };
        const json = JSON.stringify(msg);
        if (!listenToTopic) {
            console.log(json);
        }
        this.conn.publish(topic, json, mqtt.QoS.AtLeastOnce);
    }

    private async listenAppTopics(resolve: any) {
        const decoder = new TextDecoder('utf8');
        var devId = this.dev.getProperties().deviceId;
        const onPublish = async (receivedTopic: string, payload: ArrayBuffer, dup: boolean, qos: mqtt.QoS, retain: boolean) => {
            const json = decoder.decode(payload);
            console.log(`Message received on topic:"${receivedTopic}" (dup:${dup} qos:${qos} retain:${retain})`);
            console.log(json);
            const msg = JSON.parse(json);
            if (msg.deviceId == devId && msg.seq == this.dev.getProperties().pingTargetCount) {
                resolve("Received last event");
            }
        };

        var topic = this.dev.getProperties().publishToTopic;
        await this.conn.subscribe(topic, mqtt.QoS.AtLeastOnce, onPublish);
    }
}

export { Session }