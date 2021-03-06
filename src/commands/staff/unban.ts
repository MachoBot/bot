import { CommandMessage } from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { log } from '../../util'
import { Message, TextChannel, GuildChannel } from 'discord.js'
import { MachoCommand } from '../../types'

export default class UnbanCommand extends MachoCommand {
  constructor (client) {
    super(client, {
      name: 'unban',
      aliases: ['revokeban', 'pardon'],
      group: 'staff',
      memberName: 'unban',
      description: 'Unbans a user by ID.',
      details: oneLine`
        This command is pretty nice. You can unban a user using
        the user ID, used mainly for detailed auditing purposes.
			`,
      examples: ['unban 32787387784556', 'unban 291090488499879'],
      guildOnly: true,

      args: [{
        key: 'id',
        label: 'id',
        prompt: 'Who would you like to unban (ID)?',
        type: 'string',
        infinite: false
      }]
    })
  }

  async run (msg: CommandMessage, { id }: { id: string }): Promise<Message | Message[]> {
    if (!msg.member.hasPermission('BAN_MEMBERS')) {
      return msg.reply("You can't unban members.").catch(() => {
        return null
      })
    }

    const channel = msg.guild.channels.find((channel: GuildChannel) => channel.name === 'machobot-audit') as TextChannel
    const unbanResponse = await msg.guild.members.unban(id).catch(() => {
      return
    })

    if (!unbanResponse) {
      return msg.reply('I can\'t unban that user.').catch(() => {
        return null
      })
    }

    if (channel) {
      channel.send(`\`${msg.author.tag}\` (${msg.author.id}) has unbanned \`${id}\` from ${msg.guild.name}.`)
    }

    const time = new Date()
    log(`\r\n[${time}] ${msg.author.tag} (${msg.author.id}) has unbanned ${id} from ${msg.guild.name} (${msg.guild.id}).`)

    return msg.reply('Member unbanned.').catch(() => {
      return null
    })
  }
}
