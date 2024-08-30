import { thumbsupEmoji } from '../utils/thumbsupEmoji.js'
import { shrugEmoji } from '../utils/shrugEmoji.js'
import { Colors, EmbedBuilder } from 'discord.js'
import mc from 'minecraft-protocol'

export default {
    name: 'mc',
    async execute(interaction, showMessage) {
        await interaction.deferReply({ ephemeral: !showMessage })

        const host = interaction.options.get('host', true).value

        console.log(`Pinging the server ${host}`)

        try {
            const info = await mc.ping({ host })

            const embed = new EmbedBuilder()
                .setTitle('Minecraft Server Info')
                .setColor(Colors.Green)
                .addFields([
                    {
                        name: 'Host',
                        value: `${host}`,
                        inline: true
                    },
                    {
                        name: 'Players',
                        value: `${info.players.online}/${info.players.max}`,
                        inline: true
                    }
                ])
                .setFooter({ text: `Latency: ${info.latency}ms` })

            if (info.favicon) embed.setThumbnail(info.favicon)

            await interaction.followUp({
                content: thumbsupEmoji(),
                embeds: [embed]
            })
        } catch (error) {
            console.error('Failed to ping the server', error)
            await interaction.followUp({
                content: `Failed to ping the server ${shrugEmoji()}`,
                ephemeral: true
            })
            return
        }
    }
}
