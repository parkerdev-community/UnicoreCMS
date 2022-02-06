export class JWTPayload {
  sub: string
}

export class JWTRefreshPayload extends JWTPayload {
  jwtid: string
}
