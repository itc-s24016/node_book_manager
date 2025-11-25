import prisma from '../libs/db.js'

async function main() {
  const users = await prisma.user.findMany()
  console.log('ユーザー一覧:', users)
}

main()
  .then(() => console.log('DB接続OK'))
  .catch(err => console.error('DB接続エラー:', err))
  .finally(() => prisma.$disconnect())
