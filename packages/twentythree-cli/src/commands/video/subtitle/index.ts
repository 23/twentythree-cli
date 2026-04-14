import { Command } from '@oclif/core'

export default class SubtitleIndex extends Command {
  static description = 'Manage video subtitles and captions'

  async run(): Promise<void> {
    this.log('Run "twentythree video subtitle --help" for available commands')
  }
}
