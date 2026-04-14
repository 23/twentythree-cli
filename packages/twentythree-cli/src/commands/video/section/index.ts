import { Command } from '@oclif/core'

export default class SectionIndex extends Command {
  static description = 'Manage video sections (chapters)'

  async run(): Promise<void> {
    this.log('Run "twentythree video section --help" for available commands')
  }
}
