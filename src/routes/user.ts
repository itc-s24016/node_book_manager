import {Router} from 'express';
import passport from '../libs/auth.js';
import {check, validationResult} from "express-validator";
import prisma from "../libs/db.js";
import argon2 from "argon2";

const router = Router()

router.post('/login',
  passport.authenticate('local', {
    failureMessage: true,
    badRequestMessage: 'ユーザー名とパスワードを入力してください'
  }),
  async (req, res) => {
    res.json({message: 'ok'})
  }
)

router.post('/register',
  check('email').notEmpty().matches(/.+@.+/),
  check('name').notEmpty(),
  check('password').notEmpty(),
  async (req, res) => {

    // 1. 入力チェック（バリデーション）
    const result = validationResult(req)
    if (!result.isEmpty()) {
      const firstError: any = result.array()[0]

      // エラー種別を日本語に変換
      let reason = '登録に失敗しました'
      if (firstError.msg === 'Invalid value') {
        reason = 'パラメーター不足'
      }
      if (firstError.path === 'email') {
        reason = 'メールアドレスの形式が不正です'
      }

      return res.status(400).json({ reason })
    }

    try {
      // 2. パスワードをハッシュ化
      const hashedPassword = await argon2.hash(req.body.password, {
        timeCost: 2,
        memoryCost: 19456,
        parallelism: 1
      })

      // 3. DBへ登録
      const newUser = await prisma.user.create({
        data: {
          email: req.body.email,
          name: req.body.name,
          password: hashedPassword
        }
      })

      // 4. セッションログイン
      const user: Express.User = { id: newUser.id, name: newUser.name }
      req.login(user, err => {
        if (err) throw err
        return res.sendStatus(200)
      })

    } catch (e: any) {

      // 5. 重複エラー（Prisma の unique 制約）
      if (e.code === 'P2002') {
        return res.status(400).json({ reason: 'メールアドレスは既に登録されています' })
      }

      // 6. それ以外の予期しないエラー
      return res.status(500).json({ reason: 'サーバーエラーが発生しました' })
    }
  })


export default router