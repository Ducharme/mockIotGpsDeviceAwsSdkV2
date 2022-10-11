const defaultInterval : number = 1000; // milliseconds
const defaultCount : number = 3;
const defaultPort : number = 0;

export type Args = { [index: string]: any };

export interface InputValues {
    endpoint : string;
    streamingLocationTopic : string;
    streamIdRequestTopic : string,
    streamIdReplyTopic : string,
    interval :number;
    count : number;
    message : string;
    idle : boolean;

    client_id : string;
    use_websocket : boolean;
    signing_region : string;
    ca_file : string;
    cert_file : string;
    key_file : string;
    proxy_host : string;
    proxy_port : number;
    verbosity : string;
}

function getNumberOrDefault(str : string | undefined, defaultValue : number) : number {
    var hasValue = str !== undefined && str !== null && str.length > 0;
    if (hasValue)
        return parseInt(str!);
    return defaultValue;
}

function getBooleanOrDefault(str : string | undefined, defaultValue : boolean) : boolean {
    var hasValue = str !== undefined && str !== null && str.length > 0;
    if (hasValue)
        return str!.toLowerCase() == "true";
    return defaultValue;
}

export function getEnvVars () : InputValues {
    return {
        endpoint : process.env.ENDPOINT as string,
        streamingLocationTopic : process.env.STREAMING_LOCATION_TOPIC as string,
        streamIdRequestTopic : process.env.STREAMID_REQUEST_TOPIC as string,
        streamIdReplyTopic : process.env.STREAMID_REPLY_TOPIC as string,
        interval : getNumberOrDefault(process.env.INTERVAL, defaultInterval),
        count : getNumberOrDefault(process.env.COUNT, defaultCount),
        message : process.env.MESSAGE as string,
        idle : getBooleanOrDefault(process.env.IDLE, false),
    
        client_id : process.env.CLIENT_ID as string,
        use_websocket : getBooleanOrDefault(process.env.USE_WEBSOCKET, false),
        signing_region : process.env.SIGNING_REGION as string,
        ca_file : process.env.CA_FILE as string,
        cert_file : process.env.CERT_FILE as string,
        key_file : process.env.KEY_FILE as string,
        proxy_host : process.env.PROXY_HOST as string,
        proxy_port : getNumberOrDefault(process.env.PROXY_PORT, defaultPort),
        verbosity : process.env.VERBOSITY as string
    }
}

export function getCmdArgs (cmdArgs: Args) : InputValues {
    return {
        endpoint : cmdArgs.endpoint as string,
        streamingLocationTopic : cmdArgs.streamingLocationTopic as string,
        streamIdRequestTopic : cmdArgs.streamIdRequestTopic as string,
        streamIdReplyTopic : cmdArgs.streamIdReplyTopic as string,
        interval : cmdArgs.interval,
        count : cmdArgs.count as number,
        message : cmdArgs.message as string,
        idle : cmdArgs.idle as boolean,
    
        client_id : cmdArgs.client_id as string,
        use_websocket : cmdArgs.use_websocket as boolean,
        signing_region : cmdArgs.signing_region as string,
        ca_file : cmdArgs.ca_file as string,
        cert_file : cmdArgs.cert_file as string,
        key_file : cmdArgs.key_file as string,
        proxy_host : cmdArgs.proxy_host as string,
        proxy_port : cmdArgs.proxy_port as number,
        verbosity : cmdArgs.verbosity as string
    };
}
