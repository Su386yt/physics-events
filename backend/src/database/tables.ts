import Event from './event';
import * as fs from "fs";

const FOLDER_PATH = "../tables/"
const TABLE_PREFIX = "table_"

let table = new Map<string, Event[]>()


export function loadTables() {


}

export function saveTables() {

}

export function updateTable(organizer: string, events: Event[]): Event[] {
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

export function getEvents(organizer: string): Event[] {
    return table.get(organizer) ?? []
}

export function getAllEvents(): Event[] {
    let out: Event[] = []
    table.forEach(value => {
        out.push(...value)
    })

    return out
}
