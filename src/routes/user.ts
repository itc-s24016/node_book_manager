import {Router} from 'express';
import passport from '../libs/auth.js';
import {check, validationResult} from "express-validator";
import prisma from "../libs/db.js";
import argon2 from "argon2";

const router = Router()

// ログイン
router.post('/login',
  passport.authenticate('local', {
    // failureMessage: true,
    // badRequestMessage: 'ユーザー名とパスワードを入力してください'
  }),
  async (req, res) => {
    res.json({message: 'ok'})
  }
)
// router.post('/login', async (req, res, next) => {
//   passport.authenticate('local', async (err: any, user: any, info: any) => {
//     if (err) return next(err)
//     if (!user) return res.status(401).json({ reason: info?.message || '認証失敗' })
//
//     req.login(user, (err:any) => {
//       if (err) return next(err)
//       return res.status(200).json({ message: 'ok', user, sessionID: req.sessionID })
//     })
//   })(req, res, next)
// })


// 新規登録
router.post('/register',
  check('email').notEmpty().matches(/.+@.+/),
  check('name').notEmpty(),
  check('password').notEmpty(),
  async (req, res) => {
    // 1. 入力チェック
    const result = validationResult(req)
    if (!result.isEmpty()) {
      const firstError: any = result.array()[0]
      // エラーを日本語に変換
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
      // 2. ハッシュ化
      const hashedPassword = await argon2.hash(req.body.password, {
        timeCost: 2,
        memoryCost: 19456,
        parallelism: 1
      })
      // 3. 登録
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
      // 5. 重複エラー
      if (e.code === 'P2002') {
        return res.status(400).json({ reason: 'メールアドレスは既に登録されています' })
      }
      // 6. それ以外のエラー
      return res.status(500).json({ reason: 'サーバーエラーが発生しました' })
    }
  })

// ユーザー名変更
router.put('/change',
  check('name').notEmpty(),
  async (req, res) => {

    const result = validationResult(req)
    if (!result.isEmpty()) {
      return res.status(400).json({ reason: 'ユーザー名を入力してください' })
    }

    if (!req.user?.id) {
      return res.status(401).json({ reason: 'ログインが必要です' })
    }

    try {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { name: req.body.name }
      })

      req.user.name = req.body.name

      return res.status(200).json({
        message: `ユーザー名を変更しました`
      })

    } catch (e) {
      console.error(e)
      return res.status(500).json({ reason: 'サーバーエラーが発生しました' })
    }
  }
)


export default router