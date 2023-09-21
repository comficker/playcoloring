import {ResponseSharedPage} from "~/interface";
import {ofetch} from "ofetch";


export default defineEventHandler(async (event) => {
  let out = '<?xml version="1.0" encoding="UTF-8"?><?xml-stylesheet type="text/xsl" href="/sitemap-template.xsl"?>'
  const res: ResponseSharedPage = await ofetch(`${process.env.API}/coloring/tags/`)
  const now = new Date()
  out = out + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
  res.results.forEach(item => {
    out = out + '<url>' +
      `<loc>https://playcoloring.com/pages/${item.id_string}</loc>` +
      // `<lastmod>${now}</lastmod>` +
      '<changefreq>daily</changefreq>' +
      '<priority>0.8</priority>' +
      '</url>'
  })
  out = out + '</urlset>'
  defaultContentType(event, "text/xml")
  return out
})
