const cheerio = require("cheerio");
const { useScraperApiExec, useLuminaProxy } = require('../middlewares/proxy-middleware')

exports.parseHtmlWithSchema = (id, html, schema, method) => {
    const $ = cheerio.load(html) || '-';
    const result = { id, method: method };

    for (const entry of schema) {
        const [key, value] = Object.entries(entry)[0];

        try {
            if (key === "reviews") {
                const reviews = $(value)
                    .slice(0, 10)
                    .map((_, el) => $(el).text().trim())
                    .get()
                    .filter(text => text);

                result[key] = reviews.length ? reviews : ["-"];
            }
            else if (key === "count") {
                result[value.alias] = $(value.selector).length.toString() || "-";
            }
            else if (key === "check") {
                const selector = value.selector.includes("(")
                    ? value.selector.split("(")[0].trim()
                    : value.selector;
                const attribute = value.selector.includes("(")
                    ? value.selector.match(/\(([^)]+)\)/)?.[1]
                    : null;
                const element = $(selector);
                result[value.alias] = element.length > 0 &&
                    (attribute ? element.attr(attribute) : element.text().trim())
                    ? true
                    : false;
            }
            else if (key === "list" && typeof value === "object" && value.selector) {
                const items = $(value.selector)
                    .map((_, el) => $(el).text().replace(/\s+/g, " ").trim())
                    .get()
                    .filter(text => text);

                result[value.alias] = value.separator ? items.join(value.separator) : items;
            }
            else if (typeof value === "string") {
                const selector = value.includes("(")
                    ? value.split("(")[0].trim()
                    : value;
                const attribute = value.includes("(")
                    ? value.match(/\(([^)]+)\)/)?.[1]
                    : null;
                const element = $(selector);
                result[key] = attribute ? element.attr(attribute) || null : element.text().trim() || null;
            }
        } catch (error) {
            result[key] = "-";
        }
    }

    return result;
};

exports.proxyScrapingInit = async (urls, schema) => {
    try {
        const results = [];
        const totalUrls = urls.length;

        if (totalUrls < 10) {
            await Promise.all(
                urls.map(async ({ url, id }) => {
                    const html = await useScraperApiExec(url);
                    const method = 'useScraperApiExec';
                    const parsedResult = this.parseHtmlWithSchema(id, html, schema, method);
                    results.push(parsedResult);
                })
            );
            return results;
        }

        const scraperCount = Math.ceil(totalUrls * 0.60);

        await Promise.all(
            urls.map(async ({ url, id }, index) => {
                let html;
                let method;

                if (index < scraperCount) {
                    html = await useScraperApiExec(url);
                    method = 'ProxyAPI';
                } else {
                    html = await useScraperApiExec(url);
                    // html = await useLuminaProxy(url);
                    method = 'ProxyLumi';
                }

                const parsedResult = this.parseHtmlWithSchema(id, html, schema, method);
                results.push(parsedResult);
            })
        );

        return results;
    } catch (error) {
        console.error('Error in proxyScrapingInit:', error);
        throw error;
    }
};
