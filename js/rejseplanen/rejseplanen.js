import Csv from "./csv.js";


export default class Rejseplanen {

    get #TRAVEL_API_URL() {return 'https://xmlopen.rejseplanen.dk/bin/rest.exe/'};
    get #TIME_API_URL() {return 'http://worldtimeapi.org/api/timezone/'};

    #dataUrls = {
        base: 'js/rejseplanen/data/',
        stops: 'RejseplanenStoppesteder.csv'
    }
    
    #initialized = false;
    #stops = null;

    async init() {

        const path = window.location.href.replace(/(.*)\/.*\.[\w\d]+$|(.*)\/$/, '$1$2/');

        console.log('csv path: ' + path + this.#dataUrls.base + this.#dataUrls.stops);
        
        this.#stops = await Csv.load(
            path + this.#dataUrls.base + this.#dataUrls.stops, 
            ['id', 'name', 'lattitude', 'longitude'], 
            {skipRows: 1, regexReplace: [[/"/g, '']], encoding: 'windows-1252'});

        this.#initialized = true;
    }

    async getStopByName(name) {

        if (!this.#initialized) throw new Error('Rejseplanen not initialized, call init() first.');

        return this.#stops.find(stop => stop.name === name);
    }

    async getDeparturesByStopId(stopId, limit = -1, journeyDetails = false) {
        if (limit === 0) return [];

        const url = new URL('departureBoard', this.#TRAVEL_API_URL);
        
        url.searchParams.append('format', 'json');
        url.searchParams.append('id', stopId);

        const response = await fetch(url);

        const departures = (await response.json()).DepartureBoard.Departure;

        console.log(departures);

        if (limit > 0) departures.splice(limit);

        departures.forEach(departure => {
            const [day, month, year] = departure.date.split('.');
            const [hours, minutes] = departure.time.split(':');

            const date = new Date('20' + year, month - 1, day, hours, minutes);
        
            departure.dateTime = date;
        });

        if (journeyDetails) {
            await Promise.all(departures.map(async departure => {
                const url = new URL(departure.JourneyDetailRef.ref);

                const response = await fetch(url);
                const journeyDetail = (await response.json()).JourneyDetail;

                departure.journeyDetail = journeyDetail;
            }));
        }
        
        return departures;
    }

    async getDeparturesByStopName(name, limit = -1, journeyDetails = false) {
        const stop = await this.getStopByName(name);

        if (!stop) throw new Error('Stop not found');

        return await this.getDeparturesByStopId(stop.id, limit, journeyDetails);
    }

    async getCurrentTime(timeZone = 'CET') {
        const url = new URL(timeZone, this.#TIME_API_URL);
        const response = await fetch(url);
        
        const json = await response.json();

        const date = new Date(json.utc_datetime);

        const hours = date.getHours();
        const minutes = date.getMinutes();

        const time = {
            dateTime: date,
            timeString: (hours < 10 ? '0' + hours : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes)
        };

        return time;
    }
}