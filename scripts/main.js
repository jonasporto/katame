(function () {
    
  _loadTemplate();
  
  // colletion struct
  // collection = { 
  //   matchers: [
  //   {
  //     selector: '', 
  //     type: ''}
  //   ] 
  // };

  var collection = { matchers: [] };

  // store all dom elements inside the body
  var allElements = _querySelectorAll('body *');
  
  
  // close extension window
  document.querySelector('.ktme-exit-extension span').addEventListener("click", function() {
    console.info('EXIT EXTENSION CLICK');
    _querySelectorAll('[ktme]').forEach(function($ktme) {
      $ktme.remove();
    });
  });

  document.querySelector('[ktme-inspect]').addEventListener("click", inspectElement);

  function inspectElement() {
    $el = this;
    if ($el.getAttribute('inspect')) {
      console.info('EXIT INSPECT ELEMENT CLICK');
      $el.style.border = '1px solid';
      $el.removeAttribute('inspect');
      // @toFIX
      return removeClickHandle() && removeHoverHandle();
    }
    console.info('INSPECT ELEMENT CLICK');
    $el.style.border = '2px solid #0074db';
    $el.setAttribute('inspect', true);
    //    border: 2px solid #0074db;
    // highlight hover selection
    allElements.forEach(function($el_node) {
      // avoid select any element inside extension window
      if ($el_node.className.match('ktme-container') || $el_node.getAttribute('ktme') != null) return;
      $el_node.addEventListener("mouseover", mouseOverHandle);
      $el_node.addEventListener("mouseout", mouseOutHandle);
    });

  }

  function mouseOverHandle(ev) {
    $el = this;
    console.info('ELEMENT MOUSEOVER');
    
    ev.stopPropagation();
    
    $el.setAttribute('hover-inspect', true);
    
    $el.addEventListener('click', clickHandle, false);
    
    var attribute = $el.nodeName;
    if ($el.id) attribute += '#' + $el.id;
    if ($el.className) attribute += '.' + $el.className;
    
    $el.setAttribute('title', attribute);
  }

  function mouseOutHandle(ev) {
    $el = this;
    console.info('ELEMENT MOUSEOUT');
    $el.removeAttribute('hover-inspect');
  }
  
  function clickHandle(ev) {

    var $el = this;
    console.info('CLICKHANDLE ELEMENT CLICK');
    $el.setAttribute('highlighted-inspect', true);
    
    // set current url to collection url
    document.querySelector('[ktme-url]').value = location.href;
  
    ev.stopPropagation();
    ev.preventDefault();
    
    removeClickHandle();
    
    // fetch all similars by positiion
    var similarsPosition = [],
        positionSelector = treePositionSelector($el);

    if (positionSelector) {
      similarsPosition = _querySelectorAll(positionSelector);
    }

    // fetch all similars by class
    var similarsClass = [], 
        classSelector = _classSelector($el);
    
    if (classSelector) {
      similarsClass = _querySelectorAll(classSelector);
    }

    // fetch all similars by text
    var similarsText = [],
        textSelector = $el.textContent;
    
    if (textSelector) {
      similarsText = _queryTextAll(textSelector);
    }

    // fetch all similars by id
    var similarsId = [],  
        idSelector = _idSelector($el);

    if (idSelector) {
      similarsId = _querySelectorAll(idSelector);
    }

    // update counter by match type
    document.querySelector('span[ktme-count-by-position]').innerText = similarsPosition.length;
    document.querySelector('span[ktme-count-by-class]').innerText    = similarsClass.length;
    document.querySelector('span[ktme-count-by-text]').innerText     = similarsText.length;
    document.querySelector('span[ktme-count-by-id]').innerText       = similarsId.length;

    var similars, selector, similars_type;

    var highlightSimilar = function() {
      console.info('HIGHLIGHT SIMILAR');
      similars_type = document.querySelector('[name=similars]:checked').value;

      allElements.forEach(removeMatchAttribute);
      
      switch(similars_type) {
        case 'class':
          selector = classSelector;
          similars = similarsClass;
        break;
        
        case 'position':
          selector = positionSelector;
          similars = similarsPosition;
        break;
        
        case 'text':
          selector = textSelector;
          similars = similarsText;
        break;
        
        case 'id':
          selector = idSelector;
          similars = similarsId;
        break;
      }

      similarsId.forEach(function(el) {
        if (el.getAttribute('similar-inspect') || el.getAttribute('highlighted-inspect')) return;
        el.setAttribute('similar-inspect', 'id');
        if (el.querySelector('.ktme-match-options')) return;
        el.innerHTML += '<span class=\"ktme-match-options\">  <span class=\"exclude\" ktme-parent-type=\"'+el.getAttribute('similar-inspect')+'\"></span> <span class=\"select\" ktme-parent-type=\"'+el.getAttribute('similar-inspect')+'\" ktme-data-selector=\"'+idSelector+'\"></span></span>';
      });

      similarsText.forEach(function(el) {
        if (el.getAttribute('similar-inspect') || el.getAttribute('highlighted-inspect')) return;
        el.setAttribute('similar-inspect', 'text');
        if (el.querySelector('.ktme-match-options')) return;
        el.innerHTML += '<span class=\"ktme-match-options\">  <span class=\"exclude\" ktme-parent-type=\"'+el.getAttribute('similar-inspect')+'\"></span> <span class=\"select\" ktme-parent-type=\"'+el.getAttribute('similar-inspect')+'\" ktme-data-selector=\"'+textSelector+'\"></span></span>';
      });

      similarsPosition.forEach(function(el) {
        if (el.getAttribute('similar-inspect') || el.getAttribute('highlighted-inspect')) return;
        el.setAttribute('similar-inspect', 'position');
        if (el.querySelector('.ktme-match-options')) return;
        el.innerHTML += '<span class=\"ktme-match-options\">  <span class=\"exclude\" ktme-parent-type=\"'+el.getAttribute('similar-inspect')+'\"></span> <span class=\"select\" ktme-parent-type=\"'+el.getAttribute('similar-inspect')+'\" ktme-data-selector=\"'+positionSelector+'\"></span></span>';
      });

      similarsClass.forEach(function(el) {
        if (el.getAttribute('similar-inspect') || el.getAttribute('highlighted-inspect')) return;
        el.setAttribute('similar-inspect', 'class');
        if (el.querySelector('.ktme-match-options')) return;
        el.innerHTML += '<span class=\"ktme-match-options\">  <span class=\"exclude\" ktme-parent-type=\"'+el.getAttribute('similar-inspect')+'\"></span> <span class=\"select\" ktme-parent-type=\"'+el.getAttribute('similar-inspect')+'\" ktme-data-selector=\"'+classSelector+'\"></span></span>';
      });
    }

    highlightSimilar();
    
    _querySelectorAll('[name=similars]').forEach(function(el) {
      el.addEventListener('change', highlightSimilar);
    });
    
    document.querySelector('[ktme-set-collection]').addEventListener("click", function() {
      console.info('SET COLLECTION CLICK');
      console.log(collection);

    });

    // highlight collection
    document.querySelector('[ktme-highlight-collection]').addEventListener("click", function() {
      
      console.info('HIGHLIGHT COLLECTION');
      var highlightElement = function(el) {
        if (el.getAttribute('similar-inspect') || el.getAttribute('highlighted-inspect')) return;
        el.setAttribute('similar-inspect', 'class');
      }

      collection.matchers.forEach(function(matcher) {
        if (matcher.type == 'text') {
          return _queryTextAll(matcher.selector).forEach(highlightElement)
        }
        return _querySelectorAll(matcher.selector).forEach(highlightElement)
      });
    });

    _querySelectorAll('.ktme-match-options .select').forEach(function($el) {
      
      $el.addEventListener("click", function(ev) {
        
        console.info('MATCH OPTION SELECT CLICK');
        ev.stopPropagation();
        ev.preventDefault();
        
        var matcher = {
          selector : $el.getAttribute('ktme-data-selector'),
          type     : $el.getAttribute("ktme-parent-type")
        }
        
        if (collection.matchers.indexOf(matcher) == -1) {
          collection.matchers.push(matcher);
        }
        
        _querySelectorAll('[similar-inspect= ' + matcher.type + ']').forEach(removeMatchAttribute);

        counter_matchers = 0;
        collection.matchers.forEach(function(match) {
          if (match.type == 'text') {
            return counter_matchers += _queryTextAll(match.selector).length;
          }
          return counter_matchers += _querySelectorAll(match.selector).length;
        });
        document.querySelector('[ktme-matchers-count]').innerHTML = counter_matchers;
        //_animateCounter(counter_matchers);
      });
    });

    _querySelectorAll('.ktme-match-options .exclude').forEach(function($el) {
      $el.addEventListener("click", function(ev) {
        console.info('MATCH OPTION EXCLUDE CLICK');
        ev.stopPropagation();
        ev.preventDefault();
        _querySelectorAll('[similar-inspect= '+ $el.getAttribute("ktme-parent-type")+']').forEach(removeMatchAttribute);
      });
    });
  
    //chrome.runtime.sendMessage(msgr_obj, function(response) {});
  }

  function removeMatchAttribute(el) {
    console.info('REMOVE MATCH ATTRIBUTE');
    el.removeAttribute('similar-inspect');
    if (el.querySelector('.ktme-match-options')) el.querySelector('.ktme-match-options').remove();
  }

  // remove previous attached click event
  function removeClickHandle() {
    console.info('REMOVE CLICK HANDLE');
    for (var i=0; i < allElements.length; i++) {
      allElements[i].removeAttribute('hover-inspect');
      allElements[i].removeAttribute('highlighted-inspect');
    }
  }

  function removeHoverHandle() {
    console.info('REMOVE HOVER HANDLE');
    allElements.forEach(function($el_node) {
      // avoid select any element inside extension window
      if ($el_node.className.match('ktme-container') || $el_node.getAttribute('ktme') != null) return;
        $el_node.removeEventListener("mouseover");
        $el_node.removeEventListener("mouseout");
    });
  }

  
  function _to_a(list) {
    return Array.prototype.slice.call(list);
  }

  function _querySelectorAll(selector) {
    return _to_a(document.querySelectorAll(selector));
  }

  function _queryTextAll(text) {
    var elements =  [];
    // global all elements
    allElements.forEach(function(el) {
      if (el.textContent == text && $el.parentElement.nodeType == el.nodeType) {
        elements.push(el);
      }
    });

    return elements;
  }
  
  function treePositionSelector(el, selector_path) {
  
    if (selector_path == undefined) {
      var selector_path = [el.nodeName + ':' + 'nth-child('+nth_child_pos(el)+')'];
      //if (el.classList.length == 1) selector_path = [el.nodeName + '.' + el.className];
    }

    while(el.parentElement != null && el.parentElement.nodeName != 'BODY') {
      var positional = el.parentElement.nodeName;
      if (el.parentElement.nodeName == 'TR') positional = el.parentElement.nodeName + ':' + 'nth-child('+nth_child_pos(el.parentElement)+')';
      selector_path.push(positional);
      return treePositionSelector(el.parentElement, selector_path);
    }
    //selector_path.push('BODY');
    return selector_path.reverse().join(' ');
  }

  function _textSelector(el) {}

  function _idSelector($el) {
    if ($el.id) return "#" + $el.id;
  }

  function _classSelector(el) {
    var selector_path = [];
    _to_a(el.classList).forEach(function(className){
      selector_path.push(el.nodeName + '.' + className);
    });
    return selector_path.join(' , ');
  }

  function nth_child_pos(el, pos, el_ref) {
    if (pos == undefined) var pos = 1;
    if (el_ref == undefined) var el_ref = el;
    if (el.previousSibling == null) return pos;
    if (el.previousSibling.nodeType == el_ref.nodeType) pos = pos + 1;
    return nth_child_pos(el.previousSibling, pos, el_ref);
  }

  function draggableElements() {

    var selected = null, // Object of the element to be moved
    x_pos = 0, y_pos = 0, // Stores x & y coordinates of the mouse pointer
    x_elem = 0, y_elem = 0; // Stores top, left values (edge) of the element

    // Will be called when user starts dragging an element
    function _drag_init(elem) {
      // Store the object of the element which needs to be moved
      selected = elem;
      x_elem = x_pos - selected.offsetLeft;
      y_elem = y_pos - selected.offsetTop;
    }

    // Will be called when user dragging an element
    function _move_elem(e) {
      x_pos = document.all ? window.event.clientX : e.pageX;
      y_pos = document.all ? window.event.clientY : e.pageY;
      if (selected !== null) {
          selected.style.left = (x_pos - x_elem) + 'px';
          selected.style.top = (y_pos - y_elem) + 'px';
      }
    }

    // Destroy the object when we are done
    function _destroy() {
      selected = null;
    }

    // Bind the functions...
    document.querySelector('[ktme-draggable-element]').onmousedown = function () {
      _drag_init(this);
    };

    document.onmousemove = _move_elem;
    document.onmouseup = _destroy;
  }

  function _loadTemplate() {
    // begin load template
    var xmlHttp = null;

    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", chrome.extension.getURL ("layouts/menu.html"), false );
    xmlHttp.send( null );

    var inject  = document.createElement("div");
    inject.innerHTML = xmlHttp.responseText

    // open extension window and attach drag functionality
    document.body.innerHTML += inject.innerHTML;
    draggableElements();

    // close extension window
    document.querySelector('.ktme-exit-extension span').addEventListener("click", function() {
      _querySelectorAll('[ktme]').forEach(function($ktme) {
        $ktme.remove();
      })
    });
  }

  function _animateCounter(number) {

    number = number.toString().split('');
    
    var sort_for_counter = function(n) {
      var a = [], b = [];
      n = parseInt(n);
      
      for(var i=0; i <= 9; i++) {
        if (a.indexOf(n) == -1) {
          a.push(i); 
        } else {
          b.push(i);
        }
      }
      return b.concat(a);
    }

    number.forEach(function(n, i) {
      var $el = document.getElementById('digit' + ( 3 - i ))
      $el.innerHTML = sort_for_counter(n).join(' ');
    });

    _querySelectorAll('.alg .digit').forEach(function($el){
      $el.classList.remove('animate');
      $el.classList.add('animate');
    });
  }

})();

Array.prototype.equals = function(testArr) {
    if (this.length != testArr.length) return false;
    for (var i = 0; i < testArr.length; i++) {
        if (this[i].compare) { 
            if (!this[i].compare(testArr[i])) return false;
        }
        if (this[i] !== testArr[i]) return false;
    }
    return true;
}