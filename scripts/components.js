var Components = (function () {

  var _dom = {
    all  : function(selector) { return document.querySelectorAll(selector) },
    first: function(selector) { return document.querySelector(selector) }
  }

  var callback = {
    
    removeComponents: function(ev) {
      _dom.all('[ktme]').forEach(function(el) {
        el.remove();
      });
    },

    addNewProperty : function(ev) {
      collection.column = _dom.first('[ktme-property]').value;
      if (collections.indexOf(collection) == -1) collections.push(collection);
      $el = _dom.first('[ktme-collection-id="' + collection.id + '"]');
      $el.setAttribute('title', collection.column);
    
      collection = { 
        id: collection.id + 1,
        matchers: [] 
      };

      var matchers_container = _dom.first('[ktme-matchers-container]');
      matchers_container.innerHTML = '<span ktme ktme-matchers-count=\"'+0+'\" ktme-collection-id=\"'+collection.id+'\">' + 0 + ' </span>' + matchers_container.innerHTML;
    
      callback.clearProperty();
    },

    clearProperty: function(ev) {
      _dom.first('[ktme-property]').value = '';
    },

    inspectElement: function(ev) {
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
  };

  
  
  function LoadComponentError(component) {
    throw new Error('Load Error: Component '+ component +' Not Found');
  }

  function exitButton() {
    
    var exitButton = _dom.first('.ktme-exit-extension span') || new LoadComponentError('Exit Button');
    exitButton.addEventListener('click', callback.removeComponents);
  }
  
  function addPropertyButton() {

    var addPropertyButton = _dom.first('[ktme-add-property]') || new LoadComponentError('Add Property Button');
    addPropertyButton.addEventListener('click', callback.addNewProperty);
  }

  function clearPropertyButton() {
    var clearPropertyButton = _dom.first('[ktme-clear-property]') || new LoadComponentError('Clear Property Button');
    clearPropertyButton.addEventListener('click', callback.clearProperty);
  }

  function inspectButton() {
    var inspectButton = _dom.first('[ktme-inspect]') || new LoadComponentError('Inspect Button');
    inspectButton.addEventListener('click', callback.inspectElement);
  }

  function createCollectionButton() {
    var createCollectionButton = _dom.first('[ktme-set-collection]') || new LoadComponentError('Create Collection Button');
    createCollectionButton.addEventListener('click', function() { console.log(collections, collection); });
  }

  var components = [
    exitButton,
    addPropertyButton,
    clearPropertyButton,
    inspectButton,
    createCollectionButton
  ]

  return { 
    init : function() {
      components.forEach(function(fn){ fn.call(); });
    }
  }

})();