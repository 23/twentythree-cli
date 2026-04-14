import { Command } from '@oclif/core'

export default class WebinarIndex extends Command {
  static description = 'Manage webinars — create, list, update, delete, and more'

  async run(): Promise<void> {
    this.log('Run "twentythree webinar --help" for available commands')
  }
}
