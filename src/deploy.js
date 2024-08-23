import { REST, Routes, ApplicationCommandOptionType } from 'discord.js'
import { config } from 'dotenv'

config()

const commands = [
    {
        name: 'ping',
        description: 'Returns the latency of the bot'
    },
    {
        name: 'code',
        description: 'Runs the code and returns the output',
        options: [
            {
                name: 'language',
                description: 'The programming language of the code',
                type: ApplicationCommandOptionType.String,
                required: false
            }
        ]
    },
    {
        name: 'translate',
        description: 'Translates text from one language to another',
        options: [
            {
                name: 'text',
                description: 'The text to translate',
                type: ApplicationCommandOptionType.String,
                required: true
            },
            {
                name: 'from',
                description: 'The language to translate from',
                type: ApplicationCommandOptionType.String,
                required: false
            },
            {
                name: 'to',
                description: 'The language to translate to',
                type: ApplicationCommandOptionType.String,
                required: false
            }
        ]
    },
    {
        name: 'google',
        description: 'Does a google search and returns the first result',
        options: [
            {
                name: 'query',
                description: 'The query to search',
                type: ApplicationCommandOptionType.String,
                required: true
            },
            {
                name: 'results',
                description: 'The number of results to show',
                type: ApplicationCommandOptionType.Integer,
                min_value: 1,
                max_value: 10,
                required: false
            },
            {
                name: 'language',
                description: 'The language to search in',
                type: ApplicationCommandOptionType.String,
                required: false
            }
        ]
    },
    {
        name: 'ai',
        description: 'Talk to the AI',
        options: [
            {
                name: 'message',
                description: 'The message to send to the AI',
                type: ApplicationCommandOptionType.String,
                required: true
            },
            {
                name: 'image',
                description: 'The image to show to the AI',
                type: ApplicationCommandOptionType.Attachment,
                required: false
            }
        ]
    }
]

function addShowOptionAndMetadata(command) {
    if (command.options != null) {
        command.options.push({
            name: 'show',
            description: 'Show the output in the chat',
            type: ApplicationCommandOptionType.Boolean,
            required: false
        })
    } else {
        command.options = [
            {
                name: 'show',
                description: 'Show the output in the chat',
                type: ApplicationCommandOptionType.Boolean,
                required: false
            }
        ]
    }

    command.integration_types = [1]
    command.contexts = [0, 1, 2]

    return command
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN)

try {
    console.log('Started refreshing application (/) commands.')

    for (let i = 0; i < commands.length; i++) {
        const command = commands[i]
        addShowOptionAndMetadata(command)
    }

    await rest.put(Routes.applicationCommands(process.env.DISCORD_ID), {
        body: commands
    })

    console.log('Successfully reloaded application (/) commands.')
} catch (error) {
    console.error(error)
}
