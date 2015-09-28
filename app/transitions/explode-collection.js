import { isAnimating, animate, Promise } from "liquid-fire";

var createTransitionPairs = function(oldElements, newElements, key) {
  var groups = [];
  var mapper = valuesMapperFor(key);
  var keys = oldElements.concat(newElements).map(mapper).uniq();

  keys.forEach(function(keyValue) {
    var filterer = valuesFiltererFor(key, keyValue);
    var filteredOldElements = oldElements.filter(filterer);
    var filteredNewElements = newElements.filter(filterer);

    if (Ember.isEmpty(filteredOldElements)) {
      filteredOldElements.push(null);
    }

    if (Ember.isEmpty(filteredNewElements)) {
      filteredNewElements.push(null);
    }

    filteredOldElements.forEach(function(oldEl) {
      filteredNewElements.forEach(function(newEl) {
        groups.pushObject([oldEl, newEl]);
      });
    });
  });

  return groups;
};

var valuesMapperFor = function(key) {
  if (!key) {
    return function(el) { return el.view; };
  }else{
    return function(el) { return el.dom.attr(key); };
  }
};

var valuesFiltererFor = function(key, value) {
  if (!key) {
    return function(el) { return el.view == value; };
  }else{
    return function(el) { return el.dom.attr(key) == value; };
  }
};

var recognizeTransition = function(pair){
  if (Ember.isEmpty(pair[0])) return 'appear';
  if (Ember.isEmpty(pair[1])) return 'disappear';
  return 'move';
};

var animateItem = function(opitons){
  var transition = this.lookup(opitons.use[0]);
  var context = {
      older: [],
      oldElement: opitons.pair[0] ? opitons.pair[0].dom : null,
      newElement: opitons.pair[1] ? opitons.pair[1].dom : null,
      oldOffset: opitons.pair[0] ? opitons.pair[0].offset : null,
      newOffset: opitons.pair[1] ? opitons.pair[1].offset : null,
      transitionIdx: opitons.idx,
      transitedElementsCount: opitons.count
    };
  return transition.apply(context, [opitons.use[1]]);
};

export default function explodeCollection(opts={}) {
  if (!this.newElement) {
    return Promise.resolve();
  }

  var _this = this;
  var transitionPairs;
  var direction = opts.direction || 'old-to-new';
  var newElements = this.newValue.filterBy('visible');
  var oldElements = this.oldValue.filterBy('visible');
  var container = this.newElement.parent();
  var offsetTopAdjustment = container.offset().top;
  var offsetLeftAdjustment = container.offset().left;

  container.css({ position: 'relative' });

  oldElements.forEach(function(oldEl, idx){
    oldEl.dom.css({
      position: 'absolute',
      top: oldEl.offset.top - offsetTopAdjustment + 'px',
      left: oldEl.offset.left - offsetLeftAdjustment + 'px'
    });
    container.append(oldEl.dom);
  });

  if (direction == 'old-to-new') {
    transitionPairs = createTransitionPairs(oldElements, newElements, opts.keyAttr);
  }else{
    transitionPairs = createTransitionPairs(newElements, oldElements, opts.keyAttr);
  }

  return Promise.all(
      transitionPairs
        .sortBy('firstObject.offset.top')
        .map(function(pair,idx){
          var transitionType = recognizeTransition(pair);
          var transitionArgs = {
            pair: pair,
            use: opts[transitionType].use,
            idx: idx,
            count: transitionPairs.length,
            direction: direction
          };
          return animateItem.apply(_this, [transitionArgs]);
        })
    ).then(function() {
      oldElements
        .forEach(function(el) {
          el.dom.remove();
        });
    });
}
