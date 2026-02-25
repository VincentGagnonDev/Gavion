const { PrismaClient } = require('./dist/generated/prisma');
const db = new PrismaClient();

async function checkUser() {
  try {
    const user = await db.user.findUnique({
      where: { email: 'test@test.com' },
      select: { id: true, email: true, passwordHash: true, isActive: true }
    });
    console.log('User:', JSON.stringify(user, null, 2));
    
    if (user && user.passwordHash) {
      const bcrypt = require('bcrypt');
      const testPassword = 'Test123!';
      const isValid = await bcrypt.compare(testPassword, user.passwordHash);
      console.log('Password match:', isValid);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.$disconnect();
  }
}

checkUser();
