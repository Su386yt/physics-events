import Event from './event';
import EventHost from "./eventhost";

const FOLDER_PATH = "data/events/"
const TABLE_PREFIX = "table_"

export let idHostMap = new Map<string, EventHost>
export let table = new Map<EventHost, Event[]>()


export function loadTables() {
    
}

export function saveTables() {

}

export function updateTable(organizer: EventHost, events: Event[]): Event[] {
    // Remove all the past events
    let trimedEvents: Event[] = []
    for (const event of events) {
        if (event.time < new Date().getTime()) {
            continue;
        }

        trimedEvents.push(event)
    }

    let tableEvents: Event[] = table.get(organizer) ?? []
    let pastStoredEvents: Event[] = []

    // Get all the past events
    for (const event of tableEvents) {
        if (event.time > new Date().getTime()) {
            continue
        }

        pastStoredEvents.push(event)
    }

    let combinedEvents: Event[] = [...pastStoredEvents, ...trimedEvents]

    table.set(organizer, combinedEvents)

    return combinedEvents
}

export function getEvents(organizer: EventHost): Event[] {
    return table.get(organizer) ?? []
}

export function getAllEvents(): Event[] {
    let out: Event[] = []
    table.forEach(value => {
        out.push(...value)
    })

    return out
}
