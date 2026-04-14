import { Command } from '@oclif/core'

export default class CategoryIndex extends Command {
  static description = 'Manage categories — list, create, update, and delete'

  async run(): Promise<void> {
    this.log('Run "twentythree category --help" for available commands')
  }
}
