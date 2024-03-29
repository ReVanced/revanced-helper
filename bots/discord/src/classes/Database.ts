import { Database } from 'bun:sqlite'

type BasicSQLBindings = string | number | null

export class BasicDatabase<T extends Record<string, BasicSQLBindings>> {
    #db: Database
    #table: string

    constructor(file: string, struct: string, tableName = 'data') {
        const db = new Database(file, {
            create: true,
            readwrite: true,
        })

        this.#db = db
        this.#table = tableName

        db.run(`CREATE TABLE IF NOT EXISTS ${tableName} (${struct});`)
    }

    run(statement: string) {
        this.#db.run(statement)
    }

    prepare(statement: string) {
        return this.#db.prepare<T, BasicSQLBindings[]>(statement)
    }

    query(statement: string) {
        return this.#db.query<T, BasicSQLBindings[]>(statement)
    }

    insert(...values: BasicSQLBindings[]) {
        this.run(`INSERT INTO ${this.#table} VALUES (${values.map(this.#encodeValue).join(', ')});`)
    }

    update(what: Partial<T>, where: string) {
        const set = Object.entries(what)
            .map(([key, value]) => `${key} = ${this.#encodeValue(value)}`)
            .join(', ')

        this.run(`UPDATE ${this.#table} SET ${set} WHERE ${where};`)
    }

    delete(where: string) {
        this.run(`DELETE FROM ${this.#table} WHERE ${where};`)
    }

    select(columns: string[] | string, where: string) {
        const realColumns = Array.isArray(columns) ? columns.join(', ') : columns
        return this.query(`SELECT ${realColumns} FROM ${this.#table} WHERE ${where};`).get()
    }

    #encodeValue(value: unknown) {
        if (typeof value === 'string') return `'${value}'`
        if (typeof value === 'number') return value
        if (typeof value === 'boolean') return value ? 1 : 0
        if (value === null) return 'NULL'
        return null
    }
}

export class LabeledResponseDatabase {
    #db: BasicDatabase<LabeledResponse>

    constructor() {
        this.#db = new BasicDatabase<LabeledResponse>(
            'responses.db',
            `reply TEXT PRIMARY   KEY  NOT NULL,
            channel               TEXT NOT NULL,
            guild                 TEXT NOT NULL,
            referenceMessage TEXT KEY  NOT NULL,
            label                 TEXT NOT NULL,
            text                  TEXT NOT NULL,
            correctedBy           TEXT,
            CHECK (
                typeof("text") = 'text' AND
                length("text") > 0 AND
                length("text") <= 280
            )`,
        )
    }

    save({ reply, channel, guild, referenceMessage, label, text }: Omit<LabeledResponse, 'correctedBy'>) {
        const actualText = text.slice(0, 280)
        this.#db.insert(reply, channel, guild, referenceMessage, label, actualText, null)
    }

    get(reply: string) {
        return this.#db.select('*', `reply = ${reply}`)
    }

    edit(reply: string, { label, correctedBy }: Pick<LabeledResponse, 'label' | 'correctedBy'>) {
        this.#db.update({ label, correctedBy }, `reply = ${reply}`)
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
