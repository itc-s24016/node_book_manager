import {Router} from 'express';
import prisma from "../libs/db.js";

const router = Router()
const ITEMS_PER_PAGE = 5

function safeJson(data: any) {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}


router.use(async (req, res, next) => {
  // ログイン中かどうか
  if (!req.isAuthenticated()) {
    res.status(401).send('Not authenticated')
    return
  }
  next()
})

router.get('/list/:page', async (req, res) => {
  const page = parseInt(req.params.page ?? '1', 10);

  // 書籍一覧取得
  const books = await prisma.book.findMany({
    skip: (page - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE,
    where: {
      isDeleted: false
    },
    orderBy: [
      { publicationYear: 'desc' },
      { publicationMonth: 'desc' }
    ],
    select: {
      isbn: true,
      title: true,
      publicationYear: true,
      publicationMonth: true,
      author: {
        select: { name: true }
      }
    }
  });

  // 件数
  const count = await prisma.book.count({
    where: { isDeleted: false }
  });

  const lastPage = Math.ceil(count / ITEMS_PER_PAGE);

  // レスポンス形式に整形
  const response = {
    current: page,
    last_page: lastPage,
    books: books.map(book => ({
      isbn: book.isbn, // BigInt → safeJson で string 化
      title: book.title,
      author: {
        name: book.author.name
      },
      publication_year_month: `${book.publicationYear}-${String(book.publicationMonth).padStart(2, '0')}`
    }))
  };

  res.json(safeJson(response));
});

export default router