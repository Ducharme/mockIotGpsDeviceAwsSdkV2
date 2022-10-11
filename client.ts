import { mqtt, auth, http, io, iot } from 'aws-iot-device-sdk-v2';
import { Device } from './device';
import { Args } from './inputValues';
import { exitProcess } from './main';
import { Session } from './session';

class Client {

    private connection : mqtt.MqttClientConnection;
    private session : Session;

    constructor(argv: Args, dev: Device, clientId: string, timeoutToAbortInMs: number) {
        const client_bootstrap = new io.ClientBootstrap();
    
        let config_builder = null;
        if (argv.use_websocket) {
            let proxy_options = undefined;
            if (argv.proxy_host) {
                proxy_options = new http.HttpProxyOptions(argv.proxy_host, argv.proxy_port);
            }
    
            config_builder = iot.AwsIotMqttConnectionConfigBuilder.new_with_websockets({
                region: argv.signing_region,
                credentials_provider: auth.AwsCredentialsProvider.newDefault(client_bootstrap),
                proxy_options: proxy_options
            });
        } else {
            config_builder = iot.AwsIotMqttConnectionConfigBuilder.new_mtls_builder_from_path(argv.cert_file, argv.key_file);
        }
    
        if (argv.ca_file != null) {
            config_builder.with_certificate_authority_from_path(undefined, argv.ca_file);
        }
    
        config_builder.with_clean_session(false);
        config_builder.with_client_id(clientId);
        config_builder.with_endpoint(argv.endpoint);
    
        if (timeoutToAbortInMs > 0) {
            // force node to wait 60 seconds before killing itself, promises do not keep node alive
            setTimeout( async () => {
                console.log('Timeout reached! Process is killing itself');
                await this.disconnect();
                exitProcess(0);
            }, timeoutToAbortInMs );
        }
    
        const config = config_builder.build();
        const client = new mqtt.MqttClient(client_bootstrap);
        this.connection = client.new_connection(config);
        this.session = new Session(this.connection, dev, argv.streamIdRequestTopic, argv.streamIdReplyTopic);
    }
    
    public async connect() {
        this.connection.on('connect', (b) => { console.log('Client has connected: ' + b);} );
        this.connection.on('disconnect', () => { console.log('Client has disconnected');} );
        this.connection.on('error', (err) => { console.log('Client is in a bad state: ' + err);} );
        this.connection.on('interrupt', (err) => { console.log('Client was interrupted: ' + err);} );
        this.connection.on('resume', (err, msg) => { console.log('Client is resuming: ' + err + " & msg:" + msg);} );
        this.connection.on('message', (msg) => { console.log('Client is messaged: ' + msg);} );
    
        await this.connection.connect();
    }

    public async init() {
        await this.session.init();
    }

    public async execute() {
        await this.session.execute(false);
    }
    
    public async disconnect() {
        await this.waitWithMessage(100, 10, 'unsubscribe');
        this.session.close();
    
        await this.waitWithMessage(100, 10, 'disconnect');
        this.connection.disconnect();
    }
    
    private async waitWithMessage(intervalInMs: number, cycles: number, msg: string) {
        // Sleep in loop
        console.log(`Waiting ${cycles * intervalInMs} to ${msg}`);
        for (let i = 0; i < cycles; i++) {
            await new Promise(r => setTimeout(r, intervalInMs));
        }
    }
}


module.exports = { Client };
