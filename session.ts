import { mqtt } from 'aws-iot-device-sdk-v2';
import { setTimeout } from 'timers';
import { TextDecoder } from 'util';
import { Device } from './device';


class Session {
    private conn: mqtt.MqttClientConnection;
    private dev: Device;
    private requestTopic: string;
    private replyTopic: string;
    private readonly waitTime : number = 10*1000;
    private requestTimeout: NodeJS.Timeout = setTimeout(() => {}, 0);

    constructor(connection: mqtt.MqttClientConnection, device: Device, requestTopic: string, replyTopic: string) {
        this.conn = connection;
        this.dev = device;
        this.requestTopic = requestTopic;
        this.replyTopic = replyTopic;
    }

    public async init() {
        
        return new Promise(async (resolve, reject) => {
            try {
                await this.listenToStreamIdReply(resolve);
                setTimeout( () => this.requestNextStreamId(), 100 );
            }
            catch (error) {
                console.error(error);
                reject(error);
            }
        });
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

    public async close() {
        return new Promise(async (resolve, reject) => {
            try {
                const top = this.replyTopic.replace("+", this.dev.getProperties().deviceId);
                await this.conn.unsubscribe(top);

                var topic = this.dev.getProperties().publishToTopic;
                await this.conn.unsubscribe(topic);

                resolve("Unsubscribed")
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
                await this.publishNow(topic, listenToTopic);
                await sleep(interval);
                opIndex = opIndex + 1;
            }
        } else {
            for (let opIndex = 0; opIndex < count; ++opIndex) {
                const publish = async () => {
                    await this.publishNow(topic, listenToTopic);
                };
                setTimeout(publish, opIndex * interval);
            }
        }

        if (!listenToTopic) {
            var timeout = (count + 1) * interval;
            setTimeout(() => resolve("Finished publishing events"), timeout);
        }
    }

    private async publishNow(topic: string, listenToTopic: boolean) {
        this.dev.moveRandomly();
        const msg = this.dev.getPayload();
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

    private async listenToStreamIdReply(resolve: any) {
        const decoder = new TextDecoder('utf8');

        const onPublish = async (receivedTopic: string, payload: ArrayBuffer, dup: boolean, qos: mqtt.QoS, retain: boolean) => {
            const text = decoder.decode(payload);
            const json = JSON.parse(text);
            console.log(`Message received on topic ${receivedTopic} ${JSON.stringify(json)} (dup:${dup} qos:${qos} retain:${retain})`);
            this.dev.setStreamId(json.streamId);
            this.dev.setSequence(json.seq);
            resolve(`Received streamId ${json.streamId} and seq ${json.seq}`);
            clearTimeout(this.requestTimeout);
        };

        const top = this.replyTopic.replace("+", this.dev.getProperties().deviceId);
        var res = await this.conn.subscribe(top, mqtt.QoS.AtLeastOnce, onPublish);
        console.log(`Subscribing returned ${JSON.stringify(res)}`);
    }

    private async requestNextStreamId () {
        const top = this.requestTopic.replace("+", this.dev.getProperties().deviceId);
        const msg = { deviceId: this.dev.getProperties().deviceId };
        const json = JSON.stringify(msg);
        var res = await this.conn.publish(top, json, mqtt.QoS.AtLeastOnce);
        console.log(`Publishing to ${top} returned ${JSON.stringify(res)}`);

        clearTimeout(this.requestTimeout);
        console.debug(`Waiting ${this.waitTime} ms to request next streamId again`);
        this.requestTimeout = setTimeout( () => this.requestNextStreamId(), this.waitTime );
    }
}

export { Session }