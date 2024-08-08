import { Client, handle_file } from '@gradio/client'

const llava = await Client.connect('lmms-lab/LLaVA-NeXT-Interleave-Demo')
const file = handle_file(
    'https://lmms-lab-llava-next-interleave-demo.hf.space/file=/tmp/gradio/ecb26f1ab4298a4b110ec6e470f91e412ce5da69/9c8d983762baac789f939d3dfdb79a3b.png'
)

await llava.predict('/add_message', {
    history: [],
    message: {
        text: 'Describe this image',
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
        ['Describe this image', null]
    ]
})

console.log(result.data.flat()[1][1])
