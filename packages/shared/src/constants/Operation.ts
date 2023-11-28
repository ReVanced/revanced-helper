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
    ParseImage = 111,
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
    Hello = 2,

    /**
     * Server's response to client's request to parse text
     */
    ParsedText = 10,
    /**
     * Server's response to client's request to parse image
     */
    ParsedImage = 11,
    /**
     * Server's failure response to client's request to parse text
     */
    ParseTextFailed = 12,
    /**
     * Server's failure response to client's request to parse image
     */
    ParseImageFailed = 13,

    /**
     * Server's disconnect message
     */
    Disconnect = 20,
}

export const Operation = { ...ClientOperation, ...ServerOperation } as const
export type Operation = ClientOperation | ServerOperation
