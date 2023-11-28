type RequiredProperty<T> = { [P in keyof T]: Required<NonNullable<T[P]>> }
