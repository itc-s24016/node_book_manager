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

// 著者名更新
router.put('/author',
  check('id').notEmpty().withMessage('著者IDは必須です'),
  check('name').notEmpty().withMessage('著者名は必須です'),
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const firstError = result.array()[0];
      return res.status(400).json({ message: firstError.msg });
    }

    try {
      const updatedAuthor = await prisma.author.update({
        where: { id: req.body.id },
        data: { name: req.body.name }
      });

      return res.status(200).json({
        author: { id: updatedAuthor.id, name: updatedAuthor.name }
      });
    } catch (e: any) {
      // 該当IDがない場合など
      if (e.code === 'P2025') {
        return res.status(404).json({ message: '該当する著者が存在しません' });
      }
      return res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  }
);

// 著者削除
router.delete('/author',
  check('id').notEmpty().withMessage('著者IDは必須です'),
  async (req, res) => {
  const authorId = req.body.id;
  try {
    await prisma.author.delete({
      where: { id: authorId },
    });

    return res.status(200).json({ message: '著者を削除しました' });
  } catch (e: any) {
    // 該当IDがない場合など
    if (e.code === 'P2025') {
      return res.status(404).json({ message: '該当する著者が存在しません' });
    }
    return res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// 出版社登録
router.post('/publisher',
  check('name').notEmpty().withMessage('出版社名は必須です'),
  async (req, res) => {

    const result = validationResult(req)
    if (!result.isEmpty()) {
      const firstError = result.array()[0]
      return res.status(400).json({ message: firstError.msg })
    }

    try {
      const newPublisher = await prisma.publisher.create({
        data: {
          name: req.body.name
        }
      })

      return res.status(200).json({
        publisher: {
          id: newPublisher.id,
          name: newPublisher.name
        }
      })

    } catch (e: any) {
      return res.status(500).json({ message: 'サーバーエラーが発生しました' })
    }
  }
)

// 出版社更新
router.put('/publisher',
  check('id').notEmpty().withMessage('出版社IDは必須です'),
  check('name').notEmpty().withMessage('出版社名は必須です'),
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const firstError = result.array()[0];
      return res.status(400).json({ message: firstError.msg });
    }

    try {
      const updatedPublisher = await prisma.publisher.update({
        where: { id: req.body.id },
        data: { name: req.body.name }
      });

      return res.status(200).json({
        author: { id: updatedPublisher.id, name: updatedPublisher.name }
      });
    } catch (e: any) {
      // 該当IDがない場合など
      if (e.code === 'P2025') {
        return res.status(404).json({ message: '該当する出版社が存在しません' });
      }
      return res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  }
);

// 出版社削除
router.delete('/publisher',
  check('id').notEmpty().withMessage('出版社IDは必須です'),
  async (req, res) => {
    const publisherId = req.body.id;
    try {
      await prisma.publisher.delete({
        where: { id: publisherId },
      });

      return res.status(200).json({ message: '出版社を削除しました' });
    } catch (e: any) {
      // 該当IDがない場合など
      if (e.code === 'P2025') {
        return res.status(404).json({ message: '該当する出版社が存在しません' });
      }
      return res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  });

export default router
