import { io } from 'aws-iot-device-sdk-v2';
import { exit } from 'process';
import { DeviceProperties, GpsLocation, Device } from './device';
import { Args, InputValues, getEnvVars, getCmdArgs } from './inputValues';

const yargs = require('yargs');
var argv = require('yargs/yargs')(process.argv.slice(2))
    .count('endpoint').alias('e', 'endpoint').argv;
const args = require("./arguments");
const client = require("./client");

const defaultLatitude : number = 45.497216;
const defaultLongitude : number = -73.610364;
const defaultAltitude : number = 59.01;


yargs.command('*', false, args.handleArgs, main).parse();

async function main(cmdArgs: Args) {

    if (cmdArgs.idle || process.env.IDLE) {
        console.log("Idle mode detected");
        const seconds = 1;
        let sleep = function (ms: number): Promise<unknown> { return new Promise(resolve => setTimeout(resolve, ms)) };
        while (true) {
            console.log(`Sleeping for ${seconds} seconds`);
            await sleep(seconds * 1000);
        }
    }

    // Sums the total number of endpoint specified in command line arguments
    var useEnvVar = (argv.endpoint + argv.e) === 0;
    // If endpoint is not present in args then env vars are used instead
    var args : InputValues = useEnvVar ? getEnvVars() : getCmdArgs(cmdArgs);

    const fav : string = args.verbosity as string;
    var hasVerbosity = fav !== undefined && fav !== null && fav.length > 0;
    if (hasVerbosity) {
        const newVal = fav.toUpperCase();
        var level : io.LogLevel;
        switch (newVal) {
            case io.LogLevel.FATAL.toString(): level = io.LogLevel.FATAL; break;
            case io.LogLevel.ERROR.toString(): level = io.LogLevel.ERROR; break;
            case io.LogLevel.WARN.toString(): level = io.LogLevel.WARN; break;
            case io.LogLevel.INFO.toString(): level = io.LogLevel.INFO; break;
            case io.LogLevel.DEBUG.toString(): level = io.LogLevel.DEBUG; break;
            case io.LogLevel.TRACE.toString(): level = io.LogLevel.TRACE; break;
            default: level = io.LogLevel.NONE; break;

        }
        io.enable_logging(level);
    }

    console.log("Starting based on values from " + (useEnvVar ? "Env Vars" : "Cmd Args"));
    console.log(`Values endpoint:${args.endpoint}, topic:${args.topic}, `
        + `interval:${args.interval}, count:${args.count}, `
        + `message:${args.message}, idle:${args.idle}, `
        + `client_id:${args.client_id}, use_websocket:${args.use_websocket}, signing_region:${args.signing_region}, `
        + `ca_file:${args.ca_file}, cert_file:${args.cert_file}, key_file:${args.key_file}, `
        + `proxy_host:${args.proxy_host}, proxy_port:${args.proxy_port}, verbosity:${args.verbosity}`);

    const aci = args.client_id;
    var hasClientId = aci !== undefined && aci !== null && aci.length > 0;
    var clientId = hasClientId ? args.client_id : "test-" + Math.floor(Math.random() * 100000000);
    let devCfg: DeviceProperties = {
        deviceId: clientId,
        firmwareVersion: "0.0.1",
        pingIntervalInMs: args.interval,
        pingTargetCount: args.count,
        publishToTopic: args.topic
    };
    var maxGracePeriod = 5000;
    var expectedLifespan = devCfg.pingIntervalInMs * devCfg.pingTargetCount;
    var maxLifespan = expectedLifespan > 0 ? expectedLifespan + maxGracePeriod : 0;

    let gpsLoc: GpsLocation = { latitude: defaultLatitude, longitude: defaultLongitude, altitude: defaultAltitude };

    var dev = new Device(gpsLoc, devCfg);
    await client.configure(args, clientId, maxLifespan);
    await client.connect();
    var tsStart = Date.now();
    await client.run(dev, false);
    
    var tsEnd = Date.now();
    var td = (tsEnd - tsStart) - args.interval;
    var expected = devCfg.pingTargetCount * devCfg.pingIntervalInMs;
    var diff = td - expected;
    await client.disconnect();

    console.log(`Published within ${td} ms ${devCfg.pingTargetCount} updates at ${devCfg.pingIntervalInMs} ms interval`);
    console.log(`Expectation was ${expected} ms so difference is ${diff} ms`);
    exitProcess(0);
}

export function exitProcess(exitCode: number) {
    exit(exitCode);
}

