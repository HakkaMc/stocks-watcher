export const API_PREFIX = '/api'
export const REFRESH_AUTH_ENDPOINT = '/auth/refresh'
export const LOGIN_ENDPOINT = '/auth/google/login'
export const LOGOUT_ENDPOINT = '/auth/logout'

// export const GRAPHQL_ENDPOINT = 'ws://localhost:5000/graphql'
// export const GRAPHQL_ENDPOINT = 'wss://localhost:4001/api/graphql'
export const GRAPHQL_ENDPOINT = '/api/graphql'

export enum ROUTES {
  APP = '/app',
  DASHBOARD = '/app/dashboard',
  CHART_GROUPS = '/app/chartgroups',
  CHART_GROUP_VIEW = '/chartgroup/:chartGroupId',
  AUTH_FAIL = '/auth/fail',
  AUTH_SUCCESS = '/auth/success'
}

export enum ModalPriority {
  Low,
  Normal,
  High,
  Error
}

export enum ModalRoutes {
  Note,
  Reminder
}