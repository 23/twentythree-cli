import { Command } from '@oclif/core'

export default class VideoIndex extends Command {
  static description = 'Manage videos — upload, list, update, delete, and more'

  async run(): Promise<void> {
    this.log('Run "twentythree video --help" for available commands')
  }
}
