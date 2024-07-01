export const conf = {
    mongobdUrl : String(process.env.MONGODB_URL),
    port : Number(process.env.PORT),
    corsOrigin : String(process.env.CORS_ORIGIN),
    accessTokenSecret : String(process.env.ACCESS_TOKEN_SECRET),
    accessTokenExpiry : String(process.env.ACCESS_TOKEN_EXPIRY),
    refreshTokenSecret : String(process.env.REFRESH_TOKEN_SECRET),
    refreshTokenExpiry : String(process.env.REFRESH_TOKEN_EXPIRY),
}   