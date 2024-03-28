type IfExtends<T, U, True, False> = T extends U ? True : False
type IfTrue<Condition, True, False> = IfExtends<Condition, true, True, False>
type EmptyObject<K = PropertyKey> = Record<K, never>
type ValuesOf<T> = T[keyof T]
