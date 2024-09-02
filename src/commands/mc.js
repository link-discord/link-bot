import { thumbsupEmoji } from '../utils/thumbsupEmoji.js'
import { shrugEmoji } from '../utils/shrugEmoji.js'
import { Colors, EmbedBuilder } from 'discord.js'
import puppeteer from 'puppeteer'
import { AccentColor } from '../index.js'

export default {
    name: 'mc',
    async execute(interaction, showMessage) {
        await interaction.deferReply({ ephemeral: !showMessage })

        const host = interaction.options.get('host', true).value

        console.log(`Fetching the embed from ${host}`)

        try {
            const browser = await puppeteer.launch()
            const page = await browser.newPage()
            const url = `https://namemc.com/server/${host}/embed`
            await page.goto(url)
            const imageBuffer = await page.screenshot()
            await browser.close()

            const embed = new EmbedBuilder()
                .setTitle('Minecraft Server Info')
                .setColor(AccentColor)
                .setImage('attachment://screenshot.png')

            await interaction.followUp({
                content: thumbsupEmoji(),
                embeds: [embed],
                files: [{ attachment: imageBuffer, name: 'screenshot.png' }]
            })
        } catch (error) {
            console.error('Failed to fetch the embed', error)
            await interaction.followUp({
                content: `Failed to fetch the embed ${shrugEmoji()}`,
                ephemeral: true
            })
            return
        }
    }
}
