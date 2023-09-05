---
title: REST
description: Workertown services are built on the simple concept of RESTful APIs.
---

Workertown is built to provide RESTful APIs. The reasoning for this is quite
simple - it is a common, easily documented paradigm that is edge runtime
compatible. It really is as straight forward as that.

---

## What is REST?

RESTful APIs are a standard for designing web services. They use HTTP methods
(GET, POST, PUT, DELETE) to interact with resources (e.g., data) via URLs. These
APIs are stateless, scalable, and widely used, enabling efficient communication
between different systems and allowing easy integration with various
applications.

---

## Why REST?

Workertown services are designed to run at the edge, and as such, it is
important that they support a communication protocol that is compatible with
edge runtimes. As REST operates over HTTP, it is compatible with all edge
runtimes without any additional dependencies or configuration.

---

## OpenAPI (v3)

Since all Workertown services are RESTful APIs, they can be documented using
[OpenAPI v3](https://swagger.io/specification/). OpenAPI is a standard for
describing RESTful APIs, and can be used by many tools to generate
documentation, clients, and servers.

All Workertown services expose an OpenAPI v3 specification at the
`/open-api.json` endpoint. The returned specification will reflect any
configuration options that have been set for the service.

{% callout title="The public endpoint" %}
The `/open-api.json` endpoint is served from the public endpoint of your
Workertown service. If you customise the `basePath` or `endpoints.public`
options of your service, this will change the path of URL that the OpenAPI
specification is served from.
{% /callout %}
