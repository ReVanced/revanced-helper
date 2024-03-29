# 🫙 Storing data

We use SQLite to store every piece of persistent data. By using Bun, we get access to the `bun:sqlite` module which allows us to easily do SQLite operations.

## 🪄 Creating a database

You can easily create a database by initializing the `BasicDatabase` class:

```ts
interface MyDatabase {
    field: string
    key: string
}

const db = new BasicDatabase<MyDatabase>(
    // File path
    'database_file.db',
    // Database schema, in SQL
    `field TEXT NOT NULL, key TEXT PRIMARY KEY NOT NULL`,
    // Custom table name (optional, defaults to 'data'),
    'data'
)
```

## 📝 Writing data

Initializing `MyDatabase` will immediately create/open the `database_file.db` file. To write data, you can use the `insert` or `update` method:

```ts
const key = 'my key'
const field = 'some data'

// Order is according to the schema
// db.insert(...columns)
db.insert(field, key)

const field2 = 'some other data'

// db.update(data, filter)
db.update({
    field: field2
}, `key = ${key}`)
```

You can also delete a row:

```ts
db.delete(`key = ${key}`)

console.log(db.select(`key = ${key}`)) // null
```

## 👀 Reading data

To get data using a filter, you can use the `select` method:

```ts
// We insert it back
db.insert(field, key)

const data = db.select('*', `key = ${key}`)
console.log(data) // { key: 'my key', field: 'some other data' }

const { key: someKey } = db.select('key', `field = '${field2}'`)
console.log(someKey) // 'my key'
```


If the existing abstractions aren't enough, you can also use the `run`, `prepare`, or `query` method:

```ts
// Enable WAL
db.run('PRAGMA journal_mode=WAL')

const selectFromKey = db.prepare('SELECT * FROM data WHERE key = $key')

console.log(
    selectFromKey.get({
        $key: key
    })
) // { key: 'my key', field: 'some other data' }

console.log(
    selectFromKey.get({
        $key: 'non existent key'
    })
) // null
```
