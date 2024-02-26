import Rejseplanen from "./rejseplanen/rejseplanen.js";

const DEFAULT_STOP = 'Teknisk Skole, HTX (Maglelunden)';

const journeyPlanner = new Rejseplanen();
// get the searchparams from the url
const stop = new URLSearchParams(window.location.search).get('stop') ?? DEFAULT_STOP;

await journeyPlanner.init();

update();

async function update() {
    const departures = await journeyPlanner.getDeparturesByStopName(stop, 5, true);
    const time = await journeyPlanner.getCurrentTime();

    const timeElement = document.querySelector('.time');
    const tableElement = document.querySelector('.schedule');

    let output = '';

    departures.forEach(departure => {
        const minutesUntilDeparture = Math.ceil((departure.dateTime - time.dateTime) / 60000);

        const takesBicycles = departure.journeyDetail.Note.find(note => note.text === 'Cykelmedtagning gratis');
        const information = departure.journeyDetail.Note.filter(
                note => note.text !== 'Cykelmedtagning gratis' && 
                note.text.includes('Retning') === false
            ).map(note => note.text).join('<br>');


        output += `
    <tr class="schedule__row">
        <td class="schedule__cell">${departure.time}</td>
        <td class="schedule__cell">${'<span>' + departure.line + '</span>' + (takesBicycles ? '<img src="images/icons/bicycle-coaches.svg" alt="Cykelmedtagning gratis">' : '')}</td>
        <td class="schedule__cell">${departure.direction}</td>
        <td class="schedule__cell">${minutesUntilDeparture < 0 ? 0 : minutesUntilDeparture} min.</td>
        <td class="schedule__cell">${information}</td>

    </tr>
    `;
    });

    timeElement.innerHTML = time.timeString.replace(':', '<span>:</span>');

    tableElement.tBodies[0].innerHTML = output;

    setTimeout(update, 15000);
}
