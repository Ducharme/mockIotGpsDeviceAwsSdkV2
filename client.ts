import { mqtt, auth, http, io, iot } from 'aws-iot-device-sdk-v2';
import { Device } from './device';
import { Args } from './inputValues';
import { exitProcess } from './main';
import { Session } from './session';

var connection : mqtt.MqttClientConnection;
var topic: string;

async function configure(argv: Args, clientId: string, timeoutToAbortInMs: number) {
    const client_bootstrap = new io.ClientBootstrap();
    topic = argv.topic;

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
            await disconnect();
            exitProcess(0);
        }, timeoutToAbortInMs );
    }

    const config = config_builder.build();
    const client = new mqtt.MqttClient(client_bootstrap);
    connection = client.new_connection(config);
}

async function connect() {
    connection.on('connect', (b) => { console.log('Client has connected: ' + b);} );
    connection.on('disconnect', () => { console.log('Client has disconnected');} );
    connection.on('error', (err) => { console.log('Client is in a bad state: ' + err);} );
    connection.on('interrupt', (err) => { console.log('Client was interrupted: ' + err);} );
    connection.on('resume', (err, msg) => { console.log('Client is resuming: ' + err + " &  msg:" + msg);} );
    connection.on('message', (msg) => { console.log('Client is messaged: ' + msg);} );

    await connection.connect();
}

async function run(dev: Device, listenToTopic: boolean) {
    var session = new Session(connection, dev);
    await session.execute(listenToTopic);
}

async function disconnect() {
    await waitWithMessage(100, 10, 'unsubscribe');
    connection.unsubscribe(topic);

    await waitWithMessage(100, 10, 'disconnect');
    connection.disconnect();
}

async function waitWithMessage(intervalInMs: number, cycles: number, msg: string) {
    // Sleep in loop
    console.log(`Waiting ${cycles * intervalInMs} to ${msg}`);
    for (let i = 0; i < cycles; i++) {
        await new Promise(r => setTimeout(r, intervalInMs));
    }
}

module.exports = { configure, connect, run, disconnect };
