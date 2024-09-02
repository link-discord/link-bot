import { thumbsupEmoji } from '../utils/thumbsupEmoji.js'
import { shrugEmoji } from '../utils/shrugEmoji.js'
import { EmbedBuilder } from 'discord.js'
import { AccentColor } from '../index.js'

export default {
    name: 'mc',
    async execute(interaction, showMessage) {
        await interaction.deferReply({ ephemeral: !showMessage })

        const host = interaction.options.get('host', true).value

        console.log(`Pinging the server ${host}`)

        try {
            const imageUrl = `https://api.loohpjames.com/serverbanner.png?ip=${host}`

            const embed = new EmbedBuilder()
                .setTitle('Minecraft Server Info')
                .setColor(AccentColor)
                .setImage(imageUrl)

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
