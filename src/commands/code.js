import flourite from 'flourite'
import {
    codeBlock,
    ModalBuilder,
    ActionRowBuilder,
    TextInputBuilder,
    TextInputStyle,
    EmbedBuilder,
    Colors
} from 'discord.js'
import { shrugEmoji } from '../utils/shrugEmoji.js'
import { thumbsupEmoji } from '../utils/thumbsupEmoji.js'

const apiURL = 'https://emkc.org/api/v2/piston'

export default {
    name: 'code',
    async execute(interaction, showMessage) {
        const languageProvided = interaction.options.get('language')?.value

        const modal = new ModalBuilder()
            .setCustomId('codeModal')
            .setTitle('Run Code')

        const codeInput = new TextInputBuilder()
            .setCustomId('codeInput')
            .setLabel('Code')
            .setStyle(TextInputStyle.Paragraph)

        const actionRow = new ActionRowBuilder().addComponents(codeInput)

        modal.addComponents(actionRow)

        await interaction.showModal(modal)

        let modalInteraction = null

        try {
            modalInteraction = await interaction.awaitModalSubmit({
                filter: (i) => i.customId === 'codeModal',
                time: 60_000
            })
        } catch {
            return interaction.reply({
                content: `Modal timed out ${shrugEmoji()}`,
                ephemeral: true
            })
        }

        if (!modalInteraction) return

        await modalInteraction.deferReply({ ephemeral: !showMessage })

        const code = modalInteraction.fields.getTextInputValue('codeInput')
        const languagesResponse = await fetch(`${apiURL}/runtimes`)
        const languagesJson = await languagesResponse.json()
        const languages = languagesJson.map((lang) => lang.language)
        const languagesAliases = languagesJson.flatMap((lang) => lang.aliases)
        const detectedLanguage = flourite(code, { shiki: true }).language
        const language = languageProvided ?? detectedLanguage

        if (
            !languages.includes(language) &&
            !languagesAliases.includes(language)
        ) {
            if (detectedLanguage === 'unknown' && !languageProvided) {
                return modalInteraction.followUp({
                    content: 'Could not detect the language of the code.',
                    ephemeral: true
                })
            } else {
                return modalInteraction.followUp({
                    content: `The language \`${language}\` is not supported.`,
                    ephemeral: true
                })
            }
        }

        const version = languagesJson.find((lang) => {
            return lang.language === language || lang.aliases.includes(language)
        }).version

        const outputResponse = await fetch(`${apiURL}/execute`, {
            method: 'POST',
            body: JSON.stringify({
                language,
                version,
                files: [{ content: code }]
            })
        })

        const outputJson = await outputResponse.json()

        const embed = new EmbedBuilder()
            .setTitle('Code Runner')
            .addFields([
                { name: 'Code', value: codeBlock(language, code) },
                { name: 'Output', value: codeBlock(outputJson.run.output) }
            ])
            .setFooter({
                text: `Language: ${outputJson.language} (${outputJson.version}) | Exit Code: ${outputJson.run.code}`
            })
            .setColor(outputJson.run.code === 0 ? Colors.Green : Colors.Red)

        const emoji = outputJson.run.code === 0 ? thumbsupEmoji() : shrugEmoji()
        await modalInteraction.followUp({ content: emoji, embeds: [embed] })
    }
}
