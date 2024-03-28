import { Database, type SQLQueryBindings, type Statement } from 'bun:sqlite'

export class LabeledResponseDatabase {
    readonly tableName = 'labeledResponses'
    readonly tableStruct = `
        reply TEXT PRIMARY KEY   NOT NULL,
        channel            TEXT  NOT NULL,
        guild              TEXT  NOT NULL,
        referenceMessage   TEXT  NOT NULL,
        label              TEXT  NOT NULL,
        text               TEXT  NOT NULL,
        correctedBy        TEXT,
        CHECK (
            typeof("text") = 'text' AND
            length("text") > 0 AND
            length("text") <= 280
        )
    `

    #statements: {
        save: Statement
        edit: Statement
        get: Statement<LabeledResponse, SQLQueryBindings[]>
    }

    constructor() {
        // TODO: put in config
        const db = new Database('responses.db', {
            create: true,
            readwrite: true,
        })

        db.run(`CREATE TABLE IF NOT EXISTS ${this.tableName} (
            ${this.tableStruct}
        );`)

        this.#statements = {
            save: db.prepare(
                `INSERT INTO ${this.tableName} VALUES ($reply, $channel, $guild, $reference, $label, $text, NULL);`,
            ),
            edit: db.prepare(
                `UPDATE ${this.tableName} SET label = $label, correctedBy = $correctedBy WHERE reply = $reply`,
            ),
            get: db.prepare(`SELECT * FROM ${this.tableName} WHERE reply = $reply`),
        } as const
    }

    save({ reply, channel, guild, referenceMessage, label, text }: Omit<LabeledResponse, 'correctedBy'>) {
        const actualText = text.slice(0, 280)
        this.#statements.save.run({
            $reply: reply,
            $channel: channel,
            $guild: guild,
            $reference: referenceMessage,
            $label: label,
            $text: actualText,
        })
    }

    get(reply: string) {
        return this.#statements.get.get({ $reply: reply })
    }

    edit(reply: string, { label, correctedBy }: Pick<LabeledResponse, 'label' | 'correctedBy'>) {
        this.#statements.edit.run({
            $reply: reply,
            $label: label,
            $correctedBy: correctedBy,
        })
    }
}

export type LabeledResponse = {
    /**
     * The label of the response
     */
    label: string
    /**
     * The ID of the user who corrected the response
     */
    correctedBy: string | null
    /**
     * The text content of the response
     */
    text: string
    /**
     * The ID of the message that triggered the response
     */
    referenceMessage: string
    /**
     * The ID of the channel where the response was sent
     */
    channel: string
    /**
     * The ID of the guild where the response was sent
     */
    guild: string
    /**
     * The ID of the reply
     */
    reply: string
}
