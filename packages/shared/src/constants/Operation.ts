/**
 * Client operation codes for the gateway
 */
export enum ClientOperation {
    /**
     * Client's heartbeat (to check if the connection is dead or not)
     */
    Heartbeat = 100,

    /**
     * Client's request to parse text
     */
    ParseText = 110,
    /**
     * Client's request to parse image
     */
    ParseImage,
}

/**
 * Server operation codes for the gateway
 */
export enum ServerOperation {
    /**
     * Server's acknowledgement of a client's heartbeat
     */
    HeartbeatAck = 1,
    /**
     * Server's initial response to a client's connection
     */
    Hello,

    /**
     * Server's response to client's request to parse text
     */
    ParsedText = 10,
    /**
     * Server's response to client's request to parse image
     */
    ParsedImage,
    /**
     * Server's failure response to client's request to parse text
     */
    ParseTextFailed,
    /**
     * Server's failure response to client's request to parse image
     */
    ParseImageFailed,

    /**
     * Server's disconnect message
     */
    Disconnect = 20,
}

export const Operation = { ...ClientOperation, ...ServerOperation } as const
export type Operation = ClientOperation | ServerOperation
