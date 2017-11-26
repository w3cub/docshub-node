#= require ./vendor/prism
#= require ./vendor/cookies
#= require ./vendor/fastclick

#= require ./lib/util
#= require ./lib/events
#= require ./lib/cookie_store
#= require ./lib/local_storage_store
#= require ./lib/page

#= require app/app
#= require ./app/init
#= require ./app/router
#= require ./app/searcher
#= require ./app/shortcuts

#= require collections/collection
#= require_tree ./collections

#= require ./models/model
#= require_tree ./models

#= require ./views/view
#= require_tree ./views/layout
#= require_tree ./views/pages
#= require_tree ./views/list
#= require_tree ./views/search
#= require_tree ./views/sidebar
#= require_tree ./views/widget

#= require ./views/content/content
#= require ./views/content/entry_page

#= require ./templates/base
#= require ./templates/sidebar_tmpl



init = ->
  document.removeEventListener 'DOMContentLoaded', init, false

  if document.body
    app.init()
  else
    setTimeout(init, 42)

document.addEventListener 'DOMContentLoaded', init, false
