
const data = {
    name: "Service grapher demo 1",
    nodes: [
        {
            label: "Frontend",
            tags: ["P0"],
            extra: [
                {
                    "key": "URL",
                    "value": "https://some-frontend.com"
                },
            ],
        },
        {
            label: "API Gateway",
            tags: ["P0"],
            extra: [
                {
                    "key": "Authentication Type",
                    "value": "JWT"
                },
            ],
        },
        {
            label: "Backend",
            tags: ["P0"],
            extra: [
                {
                    "key": "Tech Stack",
                    "value": "Django (3.2) | Python (3.6)"
                },
            ],
        },
        {
            label: "Logging Service",
            tags: ["P1"],
            extra: [
                {
                    "key": "Sentry URL",
                    "value": "My-Sentry.sentry.io"
                },
            ],
        },
        {
            label: "Database",
            tags: ["P0"],
            extra: [
                {
                    "key": "MySQL",
                    "value": "Version: 5.5"
                },
            ],
        },
    ],
    links: [
        { source: 'frontend', target: 'api gateway' },
        { source: 'api gateway', target: 'backend' },
        { source: 'backend', target: 'database' },
        { source: 'backend', target: 'logging service' },
    ],
    more: [
        {
            name: "More links",
            url: "https://some-dummy-url.com/which/can-fetch?the=data"
        }
    ]
}

export { data };
