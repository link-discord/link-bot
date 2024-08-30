import { Client, IntentsBitField, Events, Options } from 'discord.js'
import { shrugEmoji } from './utils/shrugEmoji.js'
import fs from 'fs/promises'

const OWNER_ID = '476662199872651264'
const client = new Client({
    intents: Object.values(IntentsBitField.Flags),
    makeCache: Options.cacheEverything()
})

client.commands = new Map()

async function updateProfile() {
    console.log('Updating profile...\n')

    const owner = await client.users.fetch(OWNER_ID, { force: true })
    const avatar = owner.avatarURL({ size: 4096 })
    const banner = owner.bannerURL({ size: 4096, extension: 'gif' })

    console.log('Avatar:', avatar)
    console.log('Banner:', banner)

    try {
        await client.user.setAvatar(avatar)
        console.log('\nAvatar updated successfully')
        await client.user.setBanner(banner)
        console.log('Banner updated successfully')
        console.log('\nProfile updated successfully\n')
    } catch (error) {
        console.error('\nFailed to update profile', error)
    }
}

client.on(Events.UserUpdate, (oldUser, newUser) => {
    if (oldUser.id !== OWNER_ID) return

    console.log('Owner has updated their profile\n')

    const avatarDiff = oldUser.avatar !== newUser.avatar
    const bannerDiff = oldUser.banner !== newUser.banner

    if (avatarDiff || bannerDiff) updateProfile()
})

client.once(Events.ClientReady, async () => {
    console.log(`Logged in as ${client.user.username}\n`)

    const commandFiles = await fs.readdir('./src/commands')

    for (const file of commandFiles) {
        if (!file.endsWith('.js')) continue

        const { default: command } = await import(`./commands/${file}`)

        client.commands.set(command.name, command)
    }
})

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isCommand()) return

    const { commandName } = interaction

    if (!client.commands.has(commandName)) return

    const showMessage = interaction.options.getBoolean('show') ?? false

    try {
        const command = client.commands.get(commandName)
        await command.execute(interaction, showMessage)
    } catch (error) {
        console.error(error)

        const response = {
            content: `There was an error while executing this command ${shrugEmoji()}`,
            ephemeral: true
        }

        if (interaction.deferred || interaction.replied) {
            interaction.followUp(response)
        } else {
            await interaction.reply(response)
        }
    }
})

client.login()
