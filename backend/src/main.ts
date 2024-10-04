import {loadTables} from "./database/tables.ts";

loadTables().then(() => {
    console.log("Load Tables");
})