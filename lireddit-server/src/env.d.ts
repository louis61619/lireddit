// npx gen-env-types .env -o src/env.d.ts -e .
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string
      REDIS_URL: string
      PORT: string
      SESSION_SECRET: string
      CORS_ORIGIN: string
    }
  }
}

export {}
