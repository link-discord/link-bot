import { HfInference } from '@huggingface/inference'
import { Client, handle_file } from '@gradio/client'
import { EmbedBuilder } from 'discord.js'
import { thumbsupEmoji } from '../utils/thumbsupEmoji.js'
import { shrugEmoji } from '../utils/shrugEmoji.js'
import { AccentColor } from '../index.js'

const textModel = 'mistralai/Mistral-7B-Instruct-v0.3'
const imageModel = 'lmms-lab/LLaVA-NeXT-Interleave-Demo'

export default {
    name: 'ai',
    async execute(interaction, showMessage) {
        await interaction.deferReply({ ephemeral: !showMessage })

        const msg = interaction.options.get('message', true).value
        const attachment = interaction.options.getAttachment('image')

        let response = null

        if (attachment) {
            try {
                const llava = await Client.connect(imageModel)
                const file = handle_file(attachment.url)

                await llava.predict('/add_message', {
                    history: [],
                    message: {
                        text: msg,
                        files: [file]
                    }
                })

                const result = await llava.predict('/bot_response', {
                    history: [
                        [
                            {
                                file,
                                alt_text: null
                            },
                            null
                        ],
                        [msg, null]
                    ]
                })

                response = result.data.flat()[1][1]
            } catch (error) {
                console.error(error)
                await interaction.followUp({
                    content: `An error occurred trying to process the image ${shrugEmoji()}`,
                    ephemeral: true
                })
                return
            }
        } else {
            const inference = new HfInference(process.env.HUGGINGFACE_TOKEN)
            const data = await inference.chatCompletion({
                model: textModel,
                messages: [{ role: 'user', content: msg }],
                max_tokens: 2048
            })

            response = data.choices[0].message.content
        }

        const embed = new EmbedBuilder()
            .setTitle('AI Response')
            .setColor(AccentColor)
            .setDescription(response)

        if (attachment) embed.setImage(attachment.url)

        await interaction.followUp({
            content: thumbsupEmoji(),
            embeds: [embed]
        })
    }
}
