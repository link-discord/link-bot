const shrug_emojis = [
    '<a:shrug1:1270676587142058105>',
    '<a:shrug2:1270676700568490027>'
]

export function shrugEmoji() {
    return shrug_emojis[Math.floor(Math.random() * shrug_emojis.length)]
}
