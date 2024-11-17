// http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/
// https://github.com/Microsoft/TypeScript/wiki/What's-new-in-TypeScript#support-for-mix-in-classes

type Constructor<T> = new (...args: any[]) => T

export type IdMixin = {
  id: string
}

export type DateTimeMixin = {
  createdAt: string
  updatedAt: string
}

export type Optional<T> = T | undefined

export type Nullable<T> = T | null

export type Selectable<T> = {
  [K in keyof T]?: boolean
}
