var app = app ||  {};
app.config = {
  db_filename: "db.json",
  default_docs: ["css", "dom", "dom_events", "html", "http", "javascript"],
  docs_host: "//docs.devdocs.io",
  env: "production",
  history_cache_size: 10,
  index_filename: "index.json",
  index_path: "/docs",
  max_results: 50,
  production_host: "devdocs.io",
  search_param: "q",
  sentry_dsn: "https://5df3f4c982314008b52b799b1f25ad9d@app.getsentry.com/11245",
  version: 1462140802
}

app.collections = {};
app.models = {};
app.views = {};
