import {Router} from 'express'

const router = Router()

/* Get users listing. */
router.get('/', async (req, res, next) => {
    res.send('respond with a resource')
})

export default router