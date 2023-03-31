const stats = document.getElementById('stats')
const pigStats = document.getElementById('pig-stats')
const wolfStats = document.getElementById('wolf-stats')

const renderStats = async() => {
    wolfStats.innerHTML = ""
    pigStats.innerHTML = ""
    
    const statsRes = await fetch('./stats')
    const stats = await statsRes.json()

    for(const player of stats){
        let name = player.name
        if(player.id === socket.id) name += ' (you)'
        const row = 
        `<tr>
            <td>
                ${name}
            </td>
            <td>
                ${player.kills}
            </td>
            <td>
                ${player.deaths}
            </td>
        </tr>`
        if(player.team === 'wolfs') wolfStats.innerHTML += row
        else pigStats.innerHTML += row
    }
}

let statsState = false
const changeStatsState = () => {
    renderStats()

    statsState = !statsState
    if(statsState) stats.style.display = 'block'
    else stats.style.display = 'none'
}

export {changeStatsState}