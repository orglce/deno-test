import {serve} from "https://deno.land/std@0.58.0/http/server.ts";
import {serveFile} from "https://deno.land/std@0.58.0/http/file_server.ts";
import * as sqlite from "https://deno.land/x/sqlite@v3.4.0/mod.ts";
import {Row} from "https://deno.land/x/sqlite@v3.4.0/mod.ts";

const server = serve({port: 8000});
console.log("http://localhost:8000/");

const DB = new sqlite.DB("database/signal.db")
const DB_web = new sqlite.DB("database/signal_web.db")

async function fileExists(path: string) {
    try {
        const stats = await Deno.lstat(path);
        return stats && stats.isFile;
    } catch (e) {
        if (e && e instanceof Deno.errors.NotFound) {
            return false;
        } else {
            throw e;
        }
    }
}

for await (const req of server) {
    const path = `${Deno.cwd()}/public${req.url}`;
    console.log(req.url)
    console.time('time');
    if (await fileExists(path)) {
        const content = await serveFile(req, path);
        req.respond(content);
        continue;
    }
    if (req.url === '/') {
        const content = await serveFile(req, "./public/index.html");
        req.respond(content);
    } else if (req.url.includes("/data")) {
        const url = new URL("http://localhost:8000" + req.url);
        const startIndex = url.searchParams.get("startIndex");
        const endIndex = url.searchParams.get("endIndex");
        const result = DB_web.query(
            "SELECT * FROM sms where id >= (?) and id < (?)",
            [startIndex, endIndex]
        );

        req.respond({body: JSON.stringify(result)})

    } else if (req.url.includes("/search")) {
        const url = new URL("http://localhost:8000" + req.url);
        const search = url.searchParams.get("searchText");
        const result = DB_web.query(
            "SELECT * FROM sms where body like (?)",
            ["%" + search + "%"]
        );

        req.respond({body: JSON.stringify(result)})
    } else if (req.url === "/test") {
        const result = DB_web.query("select date(date) as date, sender, count(body) as num from sms group by date(date), sender order by date")
        console.log(result)
        req.respond({body: "Done.\n"})
    } else if (req.url === "/testData") {
        const result = DB_web.query("SELECT * FROM sms LIMIT 5")
        req.respond({body: JSON.stringify(result)})
    } else if (req.url === "/perDay") {
        const result = DB_web.query("select date, group_concat(sender), group_concat(num) from (select date(date) as date, sender, count(body) as num from sms group by date(date), sender order by date) group by date")
        req.respond({body: JSON.stringify(result)})
    } else {
        req.respond({status: 404})
    }
    console.timeEnd('time');

}