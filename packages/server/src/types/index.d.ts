declare module 'graphql-compose-relay' {
  const classes: { [key: string]: string }
  export default classes
}

declare module 'mongoose-unique-array' {
  const classes: { [key: string]: string }
  export default classes
}

export type Return<Data = any, ErrorData = any> = {
  error: string
  errorData: ErrorData
  data: Data
}

export type ReturnPromise<Data = any, ErrorData = any> = Promise<Return<Data, ErrorData>>

export type ResolverContext = {
  session: {
    userId: string
  }
}
