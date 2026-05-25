import { NextResponse } from "next/server";

/**
 * Run an Express-style (req, res) handler and return a Next.js Response.
 */
export function runHandler(handler, req) {
  return new Promise((resolve) => {
    let statusCode = 200;
    const headers = {};
    let settled = false;

    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      setHeader(name, value) {
        headers[name] = value;
        return this;
      },
      json(data) {
        if (settled) return this;
        settled = true;
        resolve(NextResponse.json(data, { status: statusCode, headers }));
        return this;
      },
      send(data) {
        if (settled) return this;
        settled = true;
        if (statusCode === 204) {
          resolve(new NextResponse(null, { status: 204, headers }));
        } else if (data == null) {
          resolve(new NextResponse(null, { status: statusCode, headers }));
        } else {
          resolve(
            new NextResponse(
              typeof data === "string" ? data : JSON.stringify(data),
              {
                status: statusCode,
                headers: {
                  "Content-Type": "application/json",
                  ...headers,
                },
              }
            )
          );
        }
        return this;
      },
      write(chunk) {
        if (!this._chunks) this._chunks = [];
        this._chunks.push(typeof chunk === "string" ? chunk : String(chunk));
        return true;
      },
      end(chunk) {
        if (settled) return this;
        settled = true;
        if (chunk) this.write(chunk);
        const body = (this._chunks || []).join("");
        resolve(
          new Response(body, {
            status: statusCode,
            headers,
          })
        );
        return this;
      },
      flushHeaders() {},
      get headersSent() {
        return settled;
      },
    };

    Promise.resolve(handler(req, res)).catch((err) => {
      if (settled) return;
      console.error(err);
      settled = true;
      resolve(
        NextResponse.json({ error: "Internal server error" }, { status: 500 })
      );
    });
  });
}
