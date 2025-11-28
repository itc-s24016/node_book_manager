import createError from 'http-errors'
import express, {NextFunction, Request, Response} from 'express'
import path from 'node:path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'

import passport from './libs/auth.js'
import session from 'express-session'

import userRouter from './routes/user.js'
import bookRouter from './routes/book.js'

const app = express()

// view engine setup
app.set('views', path.join(import.meta.dirname, 'views'))
app.set('view engine', 'pug')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())
app.use(express.static(path.join(import.meta.dirname, 'public')))
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret key',
  resave: false,
  saveUninitialized: false,
  name: 'mb_sid',
  cookie: {
    maxAge: 1000 * 60 * 60,
    httpOnly: true,
  },
}))
app.use(passport.authenticate('session'))

app.use('/user', userRouter)
app.use('/book', bookRouter)

// catch 404 and forward to error handler
app.use(async (req: Request, res: Response, next: NextFunction) => {
    throw createError(404)
})

// error handler
// app.use(async (err: unknown, req: Request, res: Response, next: NextFunction) => {
//     // set locals, only providing error in development
//     res.locals.message = hasProperty(err, 'message') && err.message || 'Unknown error'
//     res.locals.error = req.app.get('env') === 'development' ? err : {}
//
//     // render the error page
//     res.status(hasProperty(err, 'status') && Number(err.status) || 500)
//     res.render('error')
// })
app.use((err:any, req:any, res:any, next:any) => {
  console.error(err);

  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

// unknown 型のデータが、指定のプロパティを持っているかチェックするための関数
function hasProperty<K extends string>(x: unknown, ...name: K[]): x is { [M in K]: unknown } {
    return (
        x instanceof Object && name.every(prop => prop in x)
    )
}

export default app