import { Router } from "./router";

const { createServer } = require('http');

import ecstatic from 'ecstatic';

const router = new Router();
const defaultHeaders = { "Content-Type": "text/plain" };

class SkillShareServer {
    talks: string[];
    version: number;
    waiting: any[];
    server: any;

    constructor(talks: string[]) {
        this.talks = talks;
        this.version = 0;
        this.waiting = [];

        let fileServer = ecstatic({ root: "./public" });
        this.server = createServer((request: any, response: any) => {
            let resolved = router.resolve(this.request);

            if (resolved) {
                resolved.catch((error: Error) => {

                    if (error.status === null) {
                        return error;
                    }
                    return {
                        body: String(error),
                        status: 500,
                    }
                }).then(({
                    body,
                    status = 200,
                    headers = defaultHeaders,
                }) => {
                    response.writeHead(status, headers);
                    response.end(body);
                });

            } else {
                fileServer(request, response);
            }
        });
    }

    start(port:any) {
        this.server.listen(port);
    }

    stop() {
        this.server.close()
    }
}