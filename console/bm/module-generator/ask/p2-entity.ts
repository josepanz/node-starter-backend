/* eslint-disable @typescript-eslint/no-unsafe-return */
import inquirer from 'inquirer';

// Preguntar al usuario si tiene entity
export async function askForEntity(): Promise<boolean> {
  const { hasEntity } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'hasEntity',
      message: '¿Tiene entity?',
      default: true,
    },
  ]);

  return hasEntity;
}
