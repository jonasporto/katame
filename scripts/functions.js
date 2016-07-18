function inspectElement() {
    $el = this;
    if ($el.getAttribute('inspect')) {
      $el.style.border = '1px solid';
      $el.removeAttribute('inspect');
      // @toFIX
      return removeClickHandle() && removeHoverHandle();
    }
    $el.style.border = '2px solid #0074db';
    $el.setAttribute('inspect', true);
    
    var allElements = _targetElements();

    // highlight hover selection
    allElements.forEach(function($el_node) {
      // avoid select any element inside extension window
      if ($el_node.className.match('ktme-container') || $el_node.getAttribute('ktme') != null) {
        return;
      }
      $el_node.addEventListener("mouseover", mouseOverHandle);
      $el_node.addEventListener("mouseout", mouseOutHandle);
    });

  }

  function _targetElements() {
    
    var target_elements = [];
    
    _querySelectorAll('body *').forEach(function($el) {
    if ($el.className.match('ktme-container') || $el.getAttribute('ktme') != null) return;
      target_elements.push($el);
    });

    return target_elements;
  }

  
  function mouseOverHandle(ev) {
    $el = this;
    
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
    $el.removeAttribute('hover-inspect');
  }
  
  function removeMatchAttribute(el) {
    
    el.removeAttribute('similar-inspect');
    if (el.querySelector('.ktme-match-options')) el.querySelector('.ktme-match-options').remove();
  }

  // remove previous attached click event
  function removeClickHandle() {
    _targetElements().forEach(function(el) {
      el.removeAttribute('hover-inspect');
      el.removeAttribute('highlighted-inspect');
    });
  }

  function removeHoverHandle() {
    _targetElements().forEach(function($el_node) {
      // avoid select any element inside extension window
      if ($el_node.className.match('ktme-container') || $el_node.getAttribute('ktme') != null) return;
        $el_node.removeEventListener("mouseover");
        $el_node.removeEventListener("mouseout");
    });
  }

  function _querySelectorAll(selector) {
    return document.querySelectorAll(selector);
  }

  function _queryTextAll(text) {
    var elements =  [];

    _targetElements().forEach(function(el) {
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
    el.classList.forEach(function(className){
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

  function clickHandle(ev) {

    var $el = this;
    
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

      similars_type = document.querySelector('[name=similars]:checked').value;

      _targetElements().forEach(removeMatchAttribute);
      
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
    
    // highlight collection
    document.querySelector('[ktme-highlight-collection]').addEventListener("click", function() {
      
      var highlightElement = function(el, matcher) {
        if (el.getAttribute('similar-inspect') || el.getAttribute('highlighted-inspect')) return;
        el.setAttribute('similar-inspect', matcher.type);
        el.innerHTML += '<span class=\"ktme-match-options\">  <span class=\"exclude\" ktme-parent-type=\"'+el.getAttribute('similar-inspect')+'\"></span> <span class=\"select\" ktme-parent-type=\"'+el.getAttribute('similar-inspect')+'\" ktme-data-selector=\"'+matcher.selector+'\"></span></span>';
      }

      collection.matchers.forEach(function(matcher) {
        if (matcher.type == 'text') {
          return _queryTextAll(matcher.selector).forEach(function(el) {
            highlightElement(el, matcher)
          });
        }
        return _querySelectorAll(matcher.selector).forEach(function(el) {
          highlightElement(el, matcher)
        });
      });
    });

    _querySelectorAll('.ktme-match-options .select').forEach(function($el) {
      
      $el.addEventListener("click", function(ev) {
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
        
        var matchers_count = document.querySelectorAll('[ktme-matchers-count]');
        var matchers_container = document.querySelector('[ktme-matchers-container]');
        if (parseInt(matchers_count[0].getAttribute('ktme-collection-id')) == collection.id) {
          matchers_count[0].setAttribute('ktme-matchers-count', counter_matchers);
          matchers_count[0].setAttribute('ktme-collection-id', collection.id);
          matchers_count[0].innerHTML = counter_matchers;
        } else {
          matchers_container.innerHTML = '<span ktme ktme-matchers-count=\"'+counter_matchers+'\" ktme-collection-id=\"'+collection.id+'\">' + counter_matchers + ' </span>' + matchers_container.innerHTML;
        }

        //_animateCounter(counter_matchers);
      });
    });

    _querySelectorAll('.ktme-match-options .exclude').forEach(function($el) {
      $el.addEventListener("click", function(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        _querySelectorAll('[similar-inspect= '+ $el.getAttribute("ktme-parent-type")+']').forEach(removeMatchAttribute);
      });
    });
  }

  