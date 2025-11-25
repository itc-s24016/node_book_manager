import prisma from '../libs/db.js'

async function main() {
  const users = await prisma.user.findMany()
  console.log('ユーザー一覧:', users)
}

main()
  .then(() => console.log('DB接続OK'))
  .catch(err => console.error('DB接続エラー:', err))
  .finally(() => prisma.$disconnect())

// 実行方法: cd ~/WebstormProjects/book-manager
//          npx ts-node src/test/db-test.ts
//          ユーザー一覧: []
//          DB接続OK
// と表示されればOK