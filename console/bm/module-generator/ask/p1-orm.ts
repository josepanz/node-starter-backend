/* eslint-disable @typescript-eslint/no-unsafe-return */
import inquirer from 'inquirer';

// Preguntar al usuario por el ORM usando Inquirer
export async function askForOrm(): Promise<'sequelize' | 'prisma' | 'custom'> {
  const { orm } = await inquirer.prompt([
    {
      type: 'list',
      name: 'orm',
      message: '¿Qué ORM utilizarás?',
      choices: [
        { name: 'Sequelize', value: 'sequelize' },
        { name: 'Prisma', value: 'prisma' },
        { name: 'Custom', value: 'custom' },
      ],
    },
  ]);

  return orm;
}
