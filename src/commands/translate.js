import { EmbedBuilder } from 'discord.js'
import { translate } from 'bing-translate-api'
import { thumbsupEmoji } from '../utils/thumbsupEmoji.js'
import { AccentColor } from '../index.js'
import ISO6391 from 'iso-639-1'

export default {
    name: 'translate',
    async execute(interaction, showMessage) {
        const text = interaction.options.get('text', true).value
        const from = interaction.options.get('from')?.value ?? 'auto-detect'
        const to = interaction.options.get('to')?.value ?? 'en'

        if (!ISO6391.validate(to)) {
            await interaction.reply({
                content: 'Invalid language code provided.',
                ephemeral: true
            })
            return
        }

        await interaction.deferReply({ ephemeral: !showMessage })

        const translated = await translate(
            text,
            from.toLowerCase(),
            to.toLowerCase()
        )
        const fromLanguage = ISO6391.getName(translated.language.from)
        const toLanguage = ISO6391.getName(translated.language.to)
        const detected = from === 'auto-detect' ? ' (detected)' : ''
        const embed = new EmbedBuilder()
            .setTitle(`${fromLanguage}${detected} to ${toLanguage}`)
            .setColor(AccentColor)
            .addFields([
                {
                    name: 'Original',
                    value: translated.text
                },
                {
                    name: 'Translated',
                    value: translated.translation
                }
            ])

        await interaction.followUp({ content: thumbsupEmoji(), embeds: [embed] })
    }
}
