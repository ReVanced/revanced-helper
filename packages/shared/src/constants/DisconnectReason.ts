/**
 * Disconnect reasons for clients
 */
enum DisconnectReason {
    /**
     * Unknown reason
     */
    Generic = 1,
    /**
     * The client did not respond in time
     */
    TimedOut = 2,
    /**
     * The client sent an invalid packet (unserializable or invalid JSON)
     */
    InvalidPacket = 3,
    /**
     * The server has encountered an internal error
     */
    ServerError = 4,
    /**
     * The client had never connected to the server (**CLIENT-ONLY**)
     */
    NeverConnected = 5,
}

export default DisconnectReason
