import Event from './event.ts';
import { Octokit } from "@octokit/rest";
import EventHost from "./eventhost.ts";

const REPO_OWNER = "Su386yt"
const REPO_NAME = "physics-events"
const FOLDER_PATH = "data/events"
const TABLE_PREFIX = "prefix_"

export let idHostMap = new Map<string, EventHost>
export let table = new Map<EventHost, Event[]>()

const octokit = new Octokit({});

export async function loadTables() {
    const files = await getFilesInFolder(REPO_OWNER, REPO_NAME, FOLDER_PATH)
    const promises = new Array<Promise<void>>()

    files.forEach(file => {
        if (!file.startsWith(TABLE_PREFIX)) {
            return
        }

        promises.push(new Promise<void>(async (resolve, reject) => {
            const data = await getFileContent(REPO_OWNER, REPO_NAME, `${FOLDER_PATH}/${file}`)

            if (data == null) {
                return
            }

            const json = JSON.parse(data.toString());

            const header: {
                id: string,
                displayName: string,
                color: string,
                discipline: string
            } = json.header

            const eventsJson: Array<{
                name: string,
                description: string,
                date: number,
                room: string
            }> = json.events

            const host = new EventHost(header.id, header.displayName, Number.parseInt(header.color), header.discipline)
            idHostMap.set(header.id, host)

            const events = new Array<Event>()

            eventsJson.forEach((event) => {
                events.push(new Event(event.name, event.room, event.description, event.date))
            })

            table.set(host, events)

            resolve()
        }))
    })

    return Promise.all(promises).then(() => {
        console.log(table);
    });
}

// Utility function to decode base64 content
function decodeBase64(content: string): string {
    return Buffer.from(content, 'base64').toString('utf-8');
}

// Fetch and return file content from a GitHub repository
async function getFileContent(
    owner: string,
    repo: string,
    path: string
): Promise<string | null> {
    try {
        const { data } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner: owner,
            repo: repo,
            path: path,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        })

        // Ensure the response contains file content
        if ('content' in data) {
            return decodeBase64(data.content);
        } else {
            console.log(`The path "${path}" is not a file.`);
            return null;
        }
    } catch (error: any) {
        console.error(`Error fetching file content: ${error.message}`);
        return null;
    }
}

async function getFilesInFolder(owner: string, repo: string, path: string): Promise<Array<string>> {
    const array = new Array<string>()
    try {
        const { data } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner: owner,
            repo: repo,
            path: path,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        })

        if (Array.isArray(data)) {
            data.forEach((file) => {
                if (file.type === "file") {
                    array.push(file.name); // Logs the name of each file
                }
            });
            array.push()
            return array
        } else {
            return array
        }
    } catch (error) {
        console.error(error);
        return array
    }
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
