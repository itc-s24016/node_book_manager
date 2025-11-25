import createError from 'http-errors'
import express, {NextFunction, Request, Response} from 'express'
import path from 'node:path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import passport from './libs/auth.js'

import indexRouter from './routes/index.js'
import usersRouter from './routes/users.js'

const app = express()

// view engine setup
app.set('views', path.join(import.meta.dirname, 'views'))
app.set('view engine', 'pug')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())
app.use(express.static(path.join(import.meta.dirname, 'public')))

app.use('/', indexRouter)
app.use('/users', usersRouter)

// catch 404 and forward to error handler
app.use(async (req: Request, res: Response, next: NextFunction) => {
    throw createError(404)
})

// error handler
app.use(async (err: unknown, req: Request, res: Response, next: NextFunction) => {
    // set locals, only providing error in development
    res.locals.message = hasProperty(err, 'message') && err.message || 'Unknown error'
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    // render the error page
    res.status(hasProperty(err, 'status') && Number(err.status) || 500)
    res.render('error')
})

// unknown 型のデータが、指定のプロパティを持っているかチェックするための関数
function hasProperty<K extends string>(x: unknown, ...name: K[]): x is { [M in K]: unknown } {
    return (
        x instanceof Object && name.every(prop => prop in x)
    )
}

export default app