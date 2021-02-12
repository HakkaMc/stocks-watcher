declare namespace Express {
  import { Session } from 'express-session'

  export interface Request {
    session: Session & {
      userId: string
    }
  }
}
