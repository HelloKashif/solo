import db from '../db/index.js'

export default async function requireUserSession(req) {
  if (!req.session.user) {
    return {
      statusCode: 401,
      error: 'Unauthorized',
      redirect: {
        destination: `/login?next=${req.url}`,
        permanent: false,
      },
    }
  }
}
