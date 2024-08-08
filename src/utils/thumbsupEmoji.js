const thumbsup_emojis = [
    '<:thumbsup1:1270680351735287808>',
    '<:thumbsup2:1270680461693161574>',
    '<:thumbsup3:1270680505091756092>',
    '<:thumbsup4:1270680567758979082>'
]

export function thumbsupEmoji() {
    return thumbsup_emojis[Math.floor(Math.random() * thumbsup_emojis.length)]
}
