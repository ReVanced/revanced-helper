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
    TimedOut,
    /**
     * The client sent an invalid packet (unserializable or invalid JSON)
     */
    InvalidPacket,
    /**
     * The server has encountered an internal error
     */
    ServerError,
    /**
     * The client had never connected to the server (**CLIENT-ONLY**) 
     */
    NeverConnected
}

export default DisconnectReason