import { Command } from '@oclif/core'

export default class ThumbnailIndex extends Command {
  static description = 'Manage thumbnail templates — list, add, update, delete, duplicate, data, and manage files'

  async run(): Promise<void> {
    this.log('Run "twentythree thumbnail --help" for available commands')
  }
}
