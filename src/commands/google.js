import { Colors, EmbedBuilder, inlineCode } from 'discord.js'
import { stripIndents } from 'common-tags'
import { thumbsupEmoji } from '../utils/thumbsupEmoji.js'
import { shrugEmoji } from '../utils/shrugEmoji.js'
import ISO6391 from 'iso-639-1'
import { AccentColor } from '../index.js'

export default {
    name: 'google',
    async execute(interaction, showMessage) {
        await interaction.deferReply({ ephemeral: !showMessage })

        const query = interaction.options.get('query', true).value
        const language = interaction.options.get('language')?.value
        const resultsCount = interaction.options.get('results')?.value ?? 3

        if (language && !ISO6391.validate(language.toLowerCase())) {
            await interaction.followUp({
                content: `Invalid language code ${shrugEmoji()}`,
                ephemeral: true
            })
            return
        }

        try {
            const body = { q: query }

            if (language) {
                body.hl = language
                body.gl = language
            }

            const response = await fetch('https://google.serper.dev/search', {
                method: 'POST',
                headers: {
                    'X-API-KEY': process.env.SERPER_TOKEN,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            })

            if (!response.ok) {
                throw new Error(response.statusText)
            }

            const responseData = await response.json()
            const results = responseData.organic.slice(0, resultsCount)
            const resultsString = results.map((result) => {
                return `**[${result.title}](${result.link})**\n${result.snippet}`
            })

            if (!responseData.organic.length) {
                await interaction.followUp({
                    content: `No results found ${shrugEmoji()}`,
                    ephemeral: true
                })
                return
            }

            const embed = new EmbedBuilder()
                .setTitle('Google Search')
                .setColor(AccentColor).setDescription(stripIndents`
                    Results for ${inlineCode(query)}

                    ${resultsString.join('\n\n')}
                `)

            await interaction.followUp({
                content: thumbsupEmoji(),
                embeds: [embed],
                ephemeral: !showMessage
            })
        } catch (error) {
            console.error(error)
            await interaction.followUp({
                content: `Failed to fetch data ${shrugEmoji()}`,
                ephemeral: true
            })
            return
        }
    }
}
