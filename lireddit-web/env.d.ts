declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_API_URL: string
    }
  }
}

declare module 'next-apollo'
declare module '@apollo/client'

export {}
