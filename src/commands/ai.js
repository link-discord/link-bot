import { HfInference } from '@huggingface/inference'
import { EmbedBuilder } from 'discord.js'
import { thumbsupEmoji } from '../utils/thumbsupEmoji.js'
import { AccentColor } from '../index.js'

const textModel = 'meta-llama/Llama-3.2-3B-Instruct'
const imageModel = 'meta-llama/Llama-3.2-11B-Vision-Instruct'

export default {
    name: 'ai',
    async execute(interaction, showMessage) {
        await interaction.deferReply({ ephemeral: !showMessage })

        const msg = interaction.options.get('message', true).value
        const attachment = interaction.options.getAttachment('image')

        let response = null

        const inference = new HfInference(process.env.HUGGINGFACE_TOKEN)

        if (attachment) {
            const data = await inference.chatCompletion({
                model: imageModel,
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'image_url', image_url: { url: attachment.url } },
                            {
                                type: 'text',
                                text: msg
                            }
                        ]
                    }
                ],
                max_tokens: 1500
            })

            response = data.choices[0].message.content
        } else {
            const data = await inference.chatCompletion({
                model: textModel,
                messages: [{ role: 'user', content: msg }],
                max_tokens: 1500
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
