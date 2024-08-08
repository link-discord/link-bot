import { thumbsupEmoji } from '../utils/thumbsupEmoji.js'

export default {
    name: 'ping',
    async execute(interaction, showMessage) {
        const emoji = thumbsupEmoji()
        const ping = interaction.client.ws.ping

        await interaction.reply({
            content: `${emoji} My latency is \`${ping}ms\``,
            ephemeral: !showMessage
        })
    }
}
