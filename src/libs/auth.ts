import passport from 'passport'
import {Strategy as LocalStrategy} from 'passport-local'
import argon2 from 'argon2'
import prisma from './db.js'

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (username, password, done) => {
  try {
    const user = await prisma.user.findUnique({where: {email: username}})

    if (!user) {
      return done(null, false, {message: 'またはパスワードが違います'})
    }

    if (!await argon2.verify(user.password, password)) {
      return done(null, false, {message: 'またはパスワードが違います'})
    }

    return done(null, {id: user.id, name: user.name, isAdmin: user.isAdmin})
  } catch (e) {
    return done(e)
  }
}))

// passport.serializeUser<Express.User>((user, done) => {
//   process.nextTick(() => {
//     done(null, user)
//   })
// })
//
// passport.deserializeUser<Express.User>((user, done) => {
//   process.nextTick(() => {
//     return done(null, user)
//   })
// })

passport.serializeUser((user: any, done) => {
  done(null, { id: user.id, isAdmin: user.isAdmin })
})

passport.deserializeUser((user: any, done) => {
  done(null, user)
})


export default passport
