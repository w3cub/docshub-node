class app.views.Mobile extends app.View
  # @className: '_mobile'

  @elements:
    body:     'body'
    content:  '._container'
    sidebar:  '._sidebar'

  @routes:
    after: 'afterRoute'

  @detect: ->
    try
      (window.matchMedia('(max-width: 480px)').matches) or
      (window.matchMedia('(max-device-width: 767px)').matches) or
      (window.matchMedia('(max-device-height: 767px) and (max-device-width: 1024px)').matches) or
      # Need to sniff the user agent because some Android and Windows Phone devices don't take
      # resolution (dpi) into account when reporting device width/height.
      (navigator.userAgent.indexOf('Android') isnt -1 and navigator.userAgent.indexOf('Mobile') isnt -1) or
      (navigator.userAgent.indexOf('IEMobile') isnt -1)
    catch
      false

  @detectAndroidWebview: ->
    try
      /(Android).*( Version\/.\.. ).*(Chrome)/.test(navigator.userAgent)
    catch
      false

  constructor: ->
    @el = document.documentElement
    super

  init: ->
    if $.isTouchScreen()
      FastClick.attach @body
      app.shortcuts.stop()

    doc = window.document
    html = @el
    @panel = $ "._container"
    @panelCentent = $ "._content"
    @sidebar = $ "._sidebar"
    self = @
    msPointerSupported = window.navigator.msPointerEnabled
    touch = 
      'start': if msPointerSupported then 'MSPointerDown' else 'touchstart'
      'move': if msPointerSupported then 'MSPointerMove' else 'touchmove'
      'end': if msPointerSupported then 'MSPointerUp' else 'touchend'
    
    @_prefix = (->
      regex = /^(Webkit|Khtml|Moz|ms|O)(?=[A-Z])/
      styleDeclaration = doc.getElementsByTagName('script')[0].style
      for prop of styleDeclaration
        if regex.test(prop)
          return '-' + prop.match(regex)[0].toLowerCase() + '-'
      # Nothing found so far? Webkit does not enumerate over the CSS properties of the style object.
      # However (prop in style) returns the correct value, so we'll have to test for
      # the precence of a specific property
      if 'WebkitOpacity' of styleDeclaration
        return '-webkit-'
      if 'KhtmlOpacity' of styleDeclaration
        return '-khtml-'
      ''
    )()


    $.on @body, 'click', @onClick
    # $.on $('._home-link'), 'click', @onClickHome
    $.on $('._menu-link'), 'click', @onClickMenu
    $.on $('._search'), 'touchend', @onTapSearch


    scrollTimeout = undefined
    scrolling = false

    @_startOffsetX = 0
    @_currentOffsetX = 0
    @_opening = false
    @_moved = false
    @_opened = false
    @_preventOpen = false
    @_touch = true
    @_fx = 'ease';
    @_duration = 300;
    @_tolerance = 70;
    @_padding = @_translateTo = 250;
    @_orientation = 1; # left
    @_translateTo *= @_orientation;


    @_onScrollFn = $.decouple(@panelCentent, 'scroll', ->
      if !self._moved
        clearTimeout scrollTimeout
        scrolling = true
        scrollTimeout = setTimeout((->
          scrolling = false
          return
        ), 250)
      return
    )

    ###*
    # Prevents touchmove event if slideout is moving
    ###

    @_preventMove = (eve) ->
      if self._moved
        eve.preventDefault()
      return
    @panel.addEventListener touch.move, @_preventMove

    ###*
    # Resets values on touchstart
    ###

    @_resetTouchFn = (eve) ->
      if typeof eve.touches == 'undefined'
        return
      self._moved = false
      self._opening = false
      self._startOffsetX = eve.touches[0].pageX
      self._preventOpen = !self._touch or !self.isSidebarShown() and self.sidebar.clientWidth != 0
      return

    @panel.addEventListener touch.start, @_resetTouchFn


    ###*
    # Resets values on touchcancel
    ###

    @_onTouchCancelFn = ->
      self._moved = false
      self._opening = false
      return

    @panel.addEventListener 'touchcancel', @_onTouchCancelFn

    ###*
    # Toggles slideout on touchend
    ###

    @_onTouchEndFn = ->
      if self._moved
        # self.emit 'translateend'
        if self._opening and Math.abs(self._currentOffsetX) > self._tolerance then self.showSidebar() else self.hideSidebar()
      self._moved = false
      return

    @panel.addEventListener touch.end, @_onTouchEndFn

    ###*
    # Translates panel on touchmove
    ###

    @_onTouchMoveFn = (eve) ->
      if scrolling or self._preventOpen or typeof eve.touches == 'undefined'
        return
      dif_x = eve.touches[0].clientX - (self._startOffsetX)
      translateX = self._currentOffsetX = dif_x
      if Math.abs(translateX) > self._padding
        return
      if Math.abs(dif_x) > 20
        self._opening = true
        oriented_dif_x = dif_x * self._orientation
        if self._opened and oriented_dif_x > 0 or !self._opened and oriented_dif_x < 0
          return
        # if !self._moved
        #   self.emit 'translatestart'
        if oriented_dif_x <= 0
          translateX = dif_x + self._padding * self._orientation
          self._opening = false
        if !self._moved and html.className.search('_open-sidebar') == -1
          html.className += ' _open-sidebar'
        self.panel.style[self._prefix + 'transform'] = self.panel.style.transform = 'translateX(' + translateX + 'px)'
        # self.emit 'translate', translateX
        self._moved = true
      return

    @panel.addEventListener touch.move, @_onTouchMoveFn


    # app.document.sidebar.search
    #   .on 'searching', @showSidebar
    #   .on 'clear', @hideSidebar

    @activate()
    return
  _setTransition: ->
    @panel.style[@_prefix + 'transition'] = @panel.style.transition = @_prefix + 'transform ' + @_duration + 'ms ' + @_fx
    return
  _translateXTo: (translateX) -> 
    @_currentOffsetX = translateX;
    @panel.style[@_prefix + 'transform'] = @panel.style.transform = 'translateX(' + translateX + 'px)'
    return
  showSidebar: =>
    return if @isSidebarShown()
    @contentTop = @body.scrollTop
    @addClass '_open-sidebar'

    @_setTransition()
    @_translateXTo @_translateTo
    @_opened = true

    # @content.style.display = 'none'
    # @sidebar.style.display = 'block'

    if selection = @findByClass app.views.ListSelect.activeClass
      $.scrollTo selection, @body, 'center'
    else
      @body.scrollTop = @findByClass(app.views.ListFold.activeClass) and @sidebarTop or 0

    setTimeout (=>
      @panel.style.transition = @panel.style['-webkit-transition'] = @panel.style[@_prefix + 'transform'] = @panel.style.transform = ''
      return
    ), @_duration + 50
    return
  hideSidebar: =>
    return if !@isSidebarShown() and !this._opening
    @sidebarTop = @body.scrollTop
    

    @_setTransition()
    @_translateXTo 0
    @_opened = false

    # @sidebar.style.display = 'none'
    # @content.style.display = 'block'
    @body.scrollTop = @contentTop or 0
    setTimeout (=>
      @removeClass '_open-sidebar'
      @panel.style.transition = @panel.style['-webkit-transition'] = @panel.style[@_prefix + 'transform'] = @panel.style.transform = ''
      return
    ), @_duration + 50
    return

  isSidebarShown: ->
    @_opened
    # ~[].slice.call(@el.classList, 0).indexOf('_open-sidebar')
    # @sidebar.style.display isnt 'none'

  onClick: (event) =>
    if event.target.hasAttribute 'data-pick-docs'
      @showSidebar()
    return

  onClickHome: =>
    app.shortcuts.trigger 'escape'
    @hideSidebar()
    return

  onClickMenu: =>
    if @isSidebarShown() then @hideSidebar() else @showSidebar()
    return

  onTapSearch: =>
    @body.scrollTop = 0

  afterRoute: =>
    @hideSidebar()
    return
