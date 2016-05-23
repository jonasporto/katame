(function() {
  
  var xmlHttp = null;

  xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", chrome.extension.getURL ("layouts/menu.html"), false );
  xmlHttp.send( null );

  var inject  = document.createElement("div");
  inject.innerHTML = xmlHttp.responseText

  _to_a(inject.querySelectorAll('script')).forEach(function(script) { 
    eval(script.innerHTML) 
  });

  document.body.innerHTML += inject.innerHTML;
  draggableElements();
  document.querySelector('.ktme-exit-extension span').addEventListener("click", function() {
    document.querySelector('head style:last-child').remove()
    document.querySelector('.ktme-container').remove();
    window.loadInspect = function(){}
  });

  document.querySelector('[ktme-url]').value = location.href;

  var allElements = Array.prototype.slice.call(
    document.querySelectorAll('body *')
  );
  
  var clickHandle = function(ev) {
    ev.stopPropagation();
    ev.preventDefault();
    removeClickHandle();
    var clicked_el = this;
    var positionSelector = treePositionSelector(this);
    //console.log(allElements[allElements.indexOf(this)]);
    //console.log(this.nodeName, this.nodeType, this.nodeValue);
    this.setAttribute('highlighted-inspect', true);
  
    var similarsPosition = Array.prototype.slice.call(
      document.querySelectorAll(positionSelector)
    );

    document.querySelector('span[ktme-count-by-position]').innerText = similarsPosition.length;
  
    var similarsClass = [];
    var _classSelector = classSelector(this);
    if (_classSelector) {
      similarsClass = Array.prototype.slice.call(
        document.querySelectorAll(_classSelector)
      );
    }

    document.querySelector('span[ktme-count-by-class]').innerText = similarsClass.length;

    var similarsText = []
    var textSelector = this.textContent;
    var textParentElement = this.parentElement;
    for (var i = 0; i < allElements.length; i++) {
      if (allElements[i].textContent == textSelector && allElements[i].parentElement.nodeType == textParentElement.nodeType) {
        similarsText.push(allElements[i]);
      }
    }

    document.querySelector('span[ktme-count-by-text]').innerText = similarsText.length;

    var similars, selector, similars_type;

    var highlightSimilar = function() {
      similars_type = document.querySelector('[name=similars]:checked').value;
      
      switch(similars_type) {
        case 'class':
          selector = _classSelector;
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
      }

      allElements.forEach(function(el) {
        el.removeAttribute('similar-inspect')
        if (el.querySelector('.options')) el.querySelector('.options').remove();
      });

      similars.forEach(function(el) {
        if (el.getAttribute('similar-inspect') || el.getAttribute('highlighted-inspect')) return;
        el.setAttribute('similar-inspect', true);
        if (el.querySelector('.options')) return;
        el.innerHTML += '<span class=\"options\"><span class=\"exclude\"></span> <span class=\"select\"></span></span>';
      });
    }

    highlightSimilar();
    
    Array.prototype.slice.call(document.querySelectorAll('[name=similars]')).forEach(function(el) {
      el.addEventListener('change', highlightSimilar);
    });

  
    document.querySelector('[ktme-set-collection]').addEventListener("click", function() {
      console.log(selector, similars_type, similars);
    });
  

    //chrome.runtime.sendMessage(msgr_obj, function(response) {});
  }

  var removeClickHandle = function() {
    for (var i=0; i < allElements.length; i++) {
      allElements[i].removeAttribute('highlighted-inspect');
    }
  }

  var mouseOverHandle = function(ev) {
    console.log('oioi');
    ev.stopPropagation();
    this.setAttribute('hover-inspect', true);
    this.addEventListener('click', clickHandle, false);
    var attribute = this.nodeName;
    if (this.id) attribute += '#' + this.id;
    if (this.className) attribute += '.' + this.className;

    this.setAttribute('title', attribute);

  }

  var mouseOutHandle = function(ev) {
    this.removeAttribute('hover-inspect');
  }

  for (var i=0; i < allElements.length; i++) {
    if (allElements[i].className.match('ktme-container') || allElements[i].getAttribute('ktme') != null) break;
    allElements[i].addEventListener("mouseover", mouseOverHandle);
    allElements[i].addEventListener("mouseout", mouseOutHandle);
  }

})();


function _to_a(list) {
  return Array.prototype.slice.call(list);
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

function textSelector(el) {}

function idSelector(e) {}

function classSelector(el) {
  var selector_path = [];
  Array.prototype.slice.call(el.classList).forEach(function(className){
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
    return false;
  };

  document.onmousemove = _move_elem;
  document.onmouseup = _destroy;
}