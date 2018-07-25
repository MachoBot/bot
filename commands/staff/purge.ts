import * as commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { log } from '../../util'
import * as moment from 'moment'
import { Message, TextChannel, GuildChannel } from 'discord.js'

export default class PurgeCommand extends commando.Command {
  constructor (client) {
    super(client, {
      name: 'purge',
      aliases: ['delete', 'purgemsg'],
      group: 'staff',
      memberName: 'purge',
      description: 'Deletes a defined number of messages.',
      details: oneLine`
        This command deletes [amount{2 ... 100}] messages from the channel
        it is executed in.
			`,
      examples: ['purge 2', 'delete 100'],
      guildOnly: true,

      args: [{
        key: 'deleteCount',
        label: 'deleteCount',
        prompt: 'How many messages would you like to delete?',
        type: 'integer',
        infinite: false
      }]
    })
  }

  async run (msg: commando.CommandMessage, { deleteCount }: { deleteCount: number }): Promise<Message> {
    if (!(msg.member.hasPermission('MANAGE_MESSAGES'))) {
      await msg.reply("You can't delete messages.")
      return msg.delete()
    }

    if (!deleteCount || deleteCount < 2 || deleteCount > 100) {
      await msg.reply('I need a number between 2 and 100. Try again.')
      return msg.delete()
    }

    const logChannel = msg.guild.channels.find((channel: GuildChannel) => channel.name === 'machobot-audit') as TextChannel
    const channel = msg.channel as TextChannel
    const deleteResponse = await msg.channel.bulkDelete(deleteCount).catch(() => {
      return
    })

    if (!deleteResponse) {
      await msg.reply('I encountered an error whilst deleting messages. Do I have the Manage Messages permission?')
      return msg.delete()
    }

    if (logChannel) {
      logChannel.send(`${msg.author.username} has purged ${deleteCount} messages from ${channel.name}.`)
    }

    const time = moment().format('YYYY-MM-DD HH:mm:ss Z')
    log(`\r\n[${time}] ${msg.author.username} has purged ${deleteCount} messages from ${channel.name}.`)
  }
}
