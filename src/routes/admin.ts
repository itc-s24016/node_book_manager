import {Router} from 'express';
import prisma from "../libs/db.js";
import {check, validationResult} from "express-validator";

const router = Router()

router.use(async (req, res, next) => {
  // 未ログイン
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'ログインされていません' })
  }
  // isAdmin が 0 または falsy
  const user = req.user as any
  if (!user.isAdmin || user.isAdmin === 0) {
    return res.status(401).json({ message: '管理者権限がありません' })
  }
  next()
})

// 著者名登録
router.post('/author',
  check('name').notEmpty().withMessage('著者名は必須です'),
  async (req, res) => {

    const result = validationResult(req)
    if (!result.isEmpty()) {
      const firstError = result.array()[0]
      return res.status(400).json({ message: firstError.msg })
    }

    try {
      const newAuthor = await prisma.author.create({
        data: {
          name: req.body.name
        }
      })

      return res.status(200).json({
        author: {
          id: newAuthor.id,
          name: newAuthor.name
        }
      })

    } catch (e: any) {
      return res.status(500).json({ message: 'サーバーエラーが発生しました' })
    }
  }
)

export default router
