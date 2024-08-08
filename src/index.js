import { Client, IntentsBitField, Events, Options } from 'discord.js'
import { shrugEmoji } from './utils/shrugEmoji.js'
import fs from 'fs/promises'

const OWNER_ID = '476662199872651264'
const client = new Client({
    intents: Object.values(IntentsBitField.Flags),
    makeCache: Options.cacheEverything()
})

client.commands = new Map()

async function updateAvatar() {
    const owner = await client.users.fetch(OWNER_ID)
    const avatar = owner.displayAvatarURL({ dynamic: true })

    if (avatar) await client.user.setAvatar(avatar)

    console.log('Updated profile picture')
}

client.once(Events.ClientReady, async () => {
    console.log(`Logged in as ${client.user.tag}`)

    const commandFiles = await fs.readdir('./src/commands')

    for (const file of commandFiles) {
        if (!file.endsWith('.js')) continue

        const { default: command } = await import(`./commands/${file}`)

        client.commands.set(command.name, command)
    }

    let oldUser = await client.users.fetch(OWNER_ID)

    setInterval(async () => {
        const newUser = await client.users.fetch(OWNER_ID, { force: true })

        if (oldUser.avatar !== newUser.avatar) await updateAvatar()

        oldUser = newUser
    }, 60_000)
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
