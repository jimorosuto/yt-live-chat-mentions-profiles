// ==UserScript==
// @name           YouTube Live Chat Mentions + Channel Link
// @namespace      https://github.com/jimorosuto
// @version        0.1.0
// @description    UserScript for YouTube Live Chat. Left-click a name to mention, middle-click to visit channel.
// @description:ru Скрипт для чата стрима в YouTube. Клик по имени — упоминание, клик средней кнопкой — переход на канал.
// @author         jimorosuto
// @license        MIT
// @match          https://www.youtube.com/*
// @grant          none
// @icon           https://www.youtube.com/s/desktop/2cf5dafc/img/logos/favicon.ico
// @homepageURL    https://github.com/jimorosuto/yt-live-chat-mentions-profiles
// @updateURL      https://github.com/jimorosuto/yt-live-chat-mentions-profiles/raw/main/script.user.js
// @downloadURL    https://github.com/jimorosuto/yt-live-chat-mentions-profiles/raw/main/script.user.js
// @run-at         document-idle
// ==/UserScript==

(() => {
    if (location.pathname != '/live_chat') return

    const css = document.createElement('style')
    css.textContent = `
        #chat #author-name { cursor: pointer }
        #chat #author-name:hover { text-decoration: underline }
    `
    document.head.appendChild(css)

    const chat = document.querySelector('#chat')
    const inputPanel = document.querySelector('#input-panel')
    let editableField = null

    const findEditable = () => {
        editableField = inputPanel?.querySelector('#input[contenteditable]')
    }
    findEditable()

    new MutationObserver(list => {
        for (const m of list) {
            if (m.addedNodes.length) findEditable()
        }
    }).observe(inputPanel, { childList: true })

    const onNickClick = e => {
        if (e.detail > 1) return
        if (e.target.id != 'author-name') return
        if (!editableField) return

        e.preventDefault()
        e.stopPropagation()

        const nick = `@${e.target.innerText}\xa0`
        editableField.innerText = nick + editableField.innerText
        editableField.dispatchEvent(new Event('input'))

        setTimeout(() => {
            editableField.focus()
            editableField.click()
            const rng = document.createRange()
            rng.setStart(editableField, 1)
            rng.collapse(true)
            const sel = window.getSelection()
            sel.removeAllRanges()
            sel.addRange(rng)
        }, 100)
    }

    const onNickMiddleClick = e => {
        if (e.button != 1) return
        const el = e.target.closest('#author-name')
        if (!el) return

        e.preventDefault()
        e.stopPropagation()

        const msg = el.closest('yt-live-chat-text-message-renderer')
        const chanId = msg?.data?.authorExternalChannelId
        if (!chanId) return

        window.open(`https://www.youtube.com/channel/${chanId}`, '_blank')
    }

    chat.addEventListener('click', onNickClick, true)
    chat.addEventListener('auxclick', onNickMiddleClick, true)
})()
